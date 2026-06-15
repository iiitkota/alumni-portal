const jwt = require('jsonwebtoken');
const Alumni = require('../models/User');

const ADMINSECRET = process.env.ADMINSECRET || 'super-secret-key';

const tryAdminAuth = (req) => {
  const token = req.cookies?.token;
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, ADMINSECRET);
    if (decoded.access) {
      req.isAdmin = true;
      req.computedRole = 'admin';
      return true;
    }
  } catch {
    // not admin
  }
  return false;
};

const tryAlumniAuth = async (req) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const alumni = await Alumni.findById(decoded.id);
    if (!alumni) return false;
    req.user = alumni;
    req.computedRole = 'alumni';
    return true;
  } catch {
    return false;
  }
};

const authenticateBlogAuthor = async (req, res, next) => {
  if (tryAdminAuth(req)) return next();
  if (await tryAlumniAuth(req)) return next();
  return res.status(401).json({ message: 'Access denied. Alumni or admin authentication required.' });
};

const authenticateBlogEditor = async (req, res, next) => {
  const isAdmin = tryAdminAuth(req);
  const isAlumni = await tryAlumniAuth(req);
  if (!isAdmin && !isAlumni) {
    return res.status(401).json({ message: 'Access denied.' });
  }
  next();
};

module.exports = {
  authenticateBlogAuthor,
  authenticateBlogEditor
};
