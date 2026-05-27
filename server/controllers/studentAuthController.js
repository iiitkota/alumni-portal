const Student = require('../models/Student');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || process.env.MAIL_USER,
    pass: process.env.EMAIL_PASS || process.env.MAIL_PASS,
  },
});

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
    if (!personalEmail || !personalEmail.endsWith('@iiitkota.ac.in')) {
      return res.status(400).json({ message: 'Only institute emails (@iiitkota.ac.in) are allowed' });
    }

    const existingStudent = await Student.findOne({
      $or: [{ instituteId }, { personalEmail }]
    });

    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this institute ID or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const student = new Student({
      name,
      instituteId,
      branch,
      personalEmail,
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

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: 'OTP sent to your institute email' });
  } catch (error) {
    console.error('Error registering student:', error);
    return res.status(500).json({ message: 'Server error' });
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

