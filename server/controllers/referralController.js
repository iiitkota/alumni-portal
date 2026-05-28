const ReferralRequest = require('../models/ReferralRequest');
const Alumni = require('../models/User');
const pickAlumni = require('../utils/pickAlumni');
const cloudinary = require('../config/cloudinary');
const ReferralMessage = require('../models/ReferralMessage');

exports.sendReferralRequest = async (req, res) => {
  const { company, role, message, jobLink } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Resume file is required.' });
    }

    // Upload resume to Cloudinary
    // Works with both memoryStorage (buffer) and diskStorage (path)
    let uploadResult;
    try {
      let uploadSource;
      if (req.file.buffer) {
        uploadSource = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      } else if (req.file.path) {
        uploadSource = req.file.path;
      } else {
        return res.status(400).json({ message: 'Resume file could not be processed.' });
      }

      uploadResult = await cloudinary.uploader.upload(uploadSource, {
        folder: 'iiitk-referral-resumes',
        resource_type: 'raw',
        use_filename: true,
        unique_filename: true,
      });
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      return res.status(500).json({ message: 'Failed to upload resume. Please try again.' });
    }

    // Call pickAlumni to assign an alumni
    const alumni = await pickAlumni(company, role, req.user._id);

    if (!alumni) {
      // Clean up the uploaded resume since no alumni is available
      try {
        await cloudinary.uploader.destroy(uploadResult.public_id, { resource_type: 'raw' });
      } catch (err) {
        console.error('Error deleting unused resume from Cloudinary:', err);
      }

      return res.status(404).json({
        message: 'No alumni available for this company and role right now. Try again later.'
      });
    }

    // Create the ReferralRequest document
    const referralRequest = new ReferralRequest({
      student: req.user._id,
      alumni: alumni._id,
      company,
      role,
      message,
      resumeUrl: uploadResult.secure_url,
      resumePublicId: uploadResult.public_id,
      jobLink
    });

    await referralRequest.save();

    // Increment alumni's referralsReceivedThisWeek
    await Alumni.findByIdAndUpdate(alumni._id, {
      $inc: { referralsReceivedThisWeek: 1 }
    });

    return res.status(201).json({ message: 'Request sent successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'You already have a pending request for this company.'
      });
    }
    console.error('Error sending referral request:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const requests = await ReferralRequest.find({ student: req.user._id })
      .populate('alumni', 'name branch graduationYear profilePicture')
      .sort({ sentAt: -1 });

    await ReferralRequest.updateMany(
      { student: req.user._id, status: { $in: ['accepted', 'declined'] } },
      { $set: { studentSeen: true } }
    );

    return res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching student requests:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.withdrawRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const request = await ReferralRequest.findOne({ _id: id, student: req.user._id });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending requests can be withdrawn' });
    }

    request.status = 'withdrawn';
    request.withdrawnAt = new Date();
    await request.save();

    // Delete the resume from Cloudinary
    if (request.resumePublicId) {
      try {
        await cloudinary.uploader.destroy(request.resumePublicId, { resource_type: 'raw' });
      } catch (err) {
        console.error('Error deleting resume from Cloudinary during withdrawal:', err);
      }
    }

    // Decrement alumni's referralsReceivedThisWeek (min 0)
    const alumni = await Alumni.findById(request.alumni);
    if (alumni) {
      alumni.referralsReceivedThisWeek = Math.max(0, (alumni.referralsReceivedThisWeek || 0) - 1);
      await alumni.save();
    }

    return res.status(200).json({ message: 'Request withdrawn' });
  } catch (error) {
    console.error('Error withdrawing request:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getAlumniInbox = async (req, res) => {
  try {
    const requests = await ReferralRequest.find({ alumni: req.user._id })
      .populate('student', 'name branch graduationYear linkedin profilePicture')
      .sort({ sentAt: -1 });

    await ReferralRequest.updateMany(
      { alumni: req.user._id, status: 'pending' },
      { $set: { alumniSeen: true } }
    );

    return res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching alumni inbox:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.respondToRequest = async (req, res) => {
  const { id } = req.params;
  const { status, alumniMessage } = req.body;

  try {
    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Status must be accepted or declined.' });
    }

    const request = await ReferralRequest.findOne({ _id: id, alumni: req.user._id });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Already responded' });
    }

    request.status = status;
    request.alumniMessage = alumniMessage;
    request.respondedAt = new Date();
    await request.save();

    if (status === 'accepted') {
      const date = new Date();
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      const existingMonthDoc = await Alumni.findOne({
        _id: req.user._id,
        'referralsGivenByMonth.month': monthKey
      });

      if (existingMonthDoc) {
        await Alumni.updateOne(
          { _id: req.user._id, 'referralsGivenByMonth.month': monthKey },
          { $inc: { 'referralsGivenByMonth.$.count': 1 } }
        );
      } else {
        await Alumni.findByIdAndUpdate(
          req.user._id,
          { $push: { referralsGivenByMonth: { month: monthKey, count: 1 } } }
        );
      }
    }

    return res.status(200).json({ message: 'Response recorded' });
  } catch (error) {
    console.error('Error responding to request:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.setWeeklyLimit = async (req, res) => {
  const { limit } = req.body;

  try {
    if (typeof limit !== 'number' || limit < 1 || limit > 20) {
      return res.status(400).json({ message: 'Limit must be a number between 1 and 20' });
    }

    await Alumni.findByIdAndUpdate(req.user._id, { weeklyReferralLimit: limit });

    return res.status(200).json({ message: 'Weekly limit updated' });
  } catch (error) {
    console.error('Error setting weekly limit:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getMessages = async (req, res) => {
  const { id } = req.params;

  try {
    const request = await ReferralRequest.findById(id)
      .populate('student', 'name branch graduationYear profilePicture')
      .populate('alumni', 'name branch graduationYear profilePicture');

    if (!request) {
      return res.status(404).json({ message: 'Referral request not found' });
    }

    const studentIdStr = request.student?._id?.toString() || request.student?.toString();
    const alumniIdStr  = request.alumni?._id?.toString()  || request.alumni?.toString();

    if (studentIdStr !== req.user._id.toString() && alumniIdStr !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You are not a participant of this request.' });
    }

    const messages = await ReferralMessage.find({ referralRequest: id }).sort({ sentAt: 1 });

    return res.status(200).json({ request, messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.sendMessage = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  try {
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Message text is required.' });
    }

    const request = await ReferralRequest.findById(id);

    if (!request) {
      return res.status(404).json({ message: 'Referral request not found' });
    }

    if (request.student.toString() !== req.user._id.toString() && request.alumni.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You are not a participant of this request.' });
    }

    if (request.status !== 'pending' && request.status !== 'accepted') {
      return res.status(400).json({ message: 'Messages can only be sent on pending or accepted requests.' });
    }

    const message = new ReferralMessage({
      referralRequest: request._id,
      sender: req.user._id,
      senderRole: req.userRole,
      text
    });

    await message.save();

    // Emit new message via Socket.io
    try {
      const { io } = require('../server');
      io.to(request._id.toString()).emit('new_message', message);
    } catch (err) {
      // Socket.io not available — graceful fallback, message still saved
      console.warn('Socket.io emit skipped:', err.message);
    }

    return res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    let count = 0;
    if (req.userRole === 'student') {
      count = await ReferralRequest.countDocuments({
        student: req.user._id,
        status: { $in: ['accepted', 'declined'] },
        studentSeen: { $ne: true }
      });
    } else if (req.userRole === 'alumni') {
      count = await ReferralRequest.countDocuments({
        alumni: req.user._id,
        status: 'pending',
        alumniSeen: { $ne: true }
      });
    }
    return res.status(200).json({ count });
  } catch (error) {
    console.error('Error in getUnreadCount:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};