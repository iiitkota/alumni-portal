const jwt = require("jsonwebtoken");

const ADMINSECRET = process.env.ADMINSECRET || "super-secret-key";

const verifyAdmin = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, ADMINSECRET);
    if (decoded.access) {
      req.admin = decoded;
      return next();
    } else {
      return res.status(403).json({ message: "Forbidden" });
    }
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = verifyAdmin;
