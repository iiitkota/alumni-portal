const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Alumni = require('../models/User');

const authenticateStudent = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const student = await Student.findById(decoded.id);
    
    if (!student) {
      return res.status(401).json({ message: 'Access denied. Student not found.' });
    }

    req.user = student;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

const authenticateAlumni = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const alumni = await Alumni.findById(decoded.id);

    if (!alumni) {
      return res.status(401).json({ message: 'Access denied. Alumni not found.' });
    }

    req.user = alumni;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

const authenticateAny = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try Student first
    const student = await Student.findById(decoded.id);
    if (student) {
      req.user = student;
      req.userRole = 'student';
      return next();
    }

    // Try Alumni next
    const alumni = await Alumni.findById(decoded.id);
    if (alumni) {
      req.user = alumni;
      req.userRole = 'alumni';
      return next();
    }

    return res.status(401).json({ message: 'Access denied. User not found.' });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = {
  authenticateStudent,
  authenticateAlumni,
  authenticateAny
};
