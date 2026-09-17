const Student = require('../models/Student');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const getTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER || process.env.MAIL_USER,
      pass: process.env.EMAIL_PASS || process.env.MAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

exports.registerStudent = async (req, res) => {
  const {
    name,
    instituteId,
    branch,
    personalEmail,
    phoneNumber,
    graduationYear,
    currentYear,
    linkedin,
    password
  } = req.body;

  try {
    if (!personalEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalEmail)) {
      return res.status(400).json({ message: 'Invalid Email id' });
    }

    const existingStudent = await Student.findOne({
      $or: [{ instituteId: instituteId.toLowerCase() }, { personalEmail: personalEmail.toLowerCase() }]
    });

    if (existingStudent) {
      if (existingStudent.isVerified) {
        return res.status(400).json({ message: 'Student with this institute ID or email is already registered and verified. Please log in.' });
      }
      // If student is not verified, delete the old record to allow registration retry
      await Student.deleteOne({ _id: existingStudent._id });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const student = new Student({
      name,
      instituteId: instituteId.toLowerCase(),
      branch,
      personalEmail: personalEmail.toLowerCase(),
      phoneNumber,
      graduationYear,
      currentYear,
      linkedin,
      password: hashedPassword,
      otp: hashedOtp,
      otpExpires,
      isVerified: false
    });

    await student.save();

    const mailOptions = {
      from: process.env.EMAIL_USER || process.env.MAIL_USER,
      to: personalEmail,
      subject: 'IIIT Kota Alumni Portal - Student Verification OTP',
      html: `<p>Your verification OTP is <b>${otp}</b>. It is valid for 10 minutes.</p>`
    };

    console.log(`\n========================================`);
    console.log(`Attempting to send verification email...`);
    console.log(`Recipient: ${personalEmail}`);
    console.log(`Verification OTP: ${otp}`);
    console.log(`========================================\n`);

    // Send email using a fresh SSL SMTP transport connection
    try {
      const transporter = getTransporter();
      await transporter.sendMail(mailOptions);
      console.log(`Verification OTP email sent successfully to ${personalEmail}`);
    } catch (mailError) {
      console.error(`Email delivery failed via Nodemailer for ${personalEmail}:`, mailError);
      return res.status(500).json({
        message: `Failed to send verification OTP email: ${mailError.message || 'SMTP service error'}. Please check EMAIL_USER and EMAIL_PASS settings.`
      });
    }

    return res.status(200).json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Error registering student:', error);
    if (error.name === 'ValidationError') {
       return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

exports.resendOtp = async (req, res) => {
  const { personalEmail } = req.body;

  try {
    if (!personalEmail) {
      return res.status(400).json({ message: 'Personal email is required' });
    }

    const student = await Student.findOne({ personalEmail: personalEmail.toLowerCase() });
    if (!student) {
      return res.status(404).json({ message: 'Student registration record not found. Please register again.' });
    }

    if (student.isVerified) {
      return res.status(400).json({ message: 'This account is already verified. Please log in.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    student.otp = hashedOtp;
    student.otpExpires = otpExpires;
    await student.save();

    const mailOptions = {
      from: process.env.EMAIL_USER || process.env.MAIL_USER,
      to: personalEmail,
      subject: 'IIIT Kota Alumni Portal - Resent Verification OTP',
      html: `<p>Your new verification OTP is <b>${otp}</b>. It is valid for 10 minutes.</p>`
    };

    const transporter = getTransporter();
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: 'A new OTP has been sent to your email.' });
  } catch (error) {
    console.error('Error resending OTP:', error);
    return res.status(500).json({ message: `Failed to resend OTP: ${error.message || 'SMTP error'}` });
  }
};

exports.verifyOtp = async (req, res) => {
  const { personalEmail, otp } = req.body;

  try {
    const student = await Student.findOne({ personalEmail });
    if (!student) {
      return res.status(400).json({ message: 'Student not found' });
    }

    if (!student.otpExpires || student.otpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    const isMatch = await bcrypt.compare(otp, student.otp);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    student.isVerified = true;
    student.otp = undefined;
    student.otpExpires = undefined;
    await student.save();

    const token = jwt.sign(
      { id: student._id, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({ token });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.loginStudent = async (req, res) => {
  const { instituteId, password } = req.body;

  try {
    if (!instituteId) {
      return res.status(400).json({ message: 'Institute ID is required' });
    }

    const student = await Student.findOne({ instituteId: instituteId.toLowerCase() });
    if (!student) {
      return res.status(400).json({ message: 'Invalid institute ID or password' });
    }

    if (!student.isVerified) {
      return res.status(403).json({ message: 'Please verify your email first' });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid institute ID or password' });
    }

    const token = jwt.sign(
      { id: student._id, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({ token });
  } catch (error) {
    console.error('Error logging in student:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id).select('-password -otp -otpExpires');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    return res.status(200).json(student);
  } catch (error) {
    console.error('Error fetching student profile:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

