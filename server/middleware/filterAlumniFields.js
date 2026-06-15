const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

/**
 * Middleware that checks if the request is initiated by a Student.
 * Attaches req.requesterIsStudent to the request object.
 * This is a soft check and never blocks the request.
 */
const filterAlumniFields = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      req.requesterIsStudent = false;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const student = await Student.findById(decoded.id);

    req.requesterIsStudent = !!student;
    next();
  } catch (error) {
    req.requesterIsStudent = false;
    next();
  }
};

module.exports = filterAlumniFields;
