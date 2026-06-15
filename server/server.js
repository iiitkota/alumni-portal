const bufferModule = require('buffer');
if (!bufferModule.SlowBuffer) {
  bufferModule.SlowBuffer = bufferModule.Buffer;
}
require("dotenv").config(); // Load environment variables

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require('path');
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const alumniRoutes = require("./routes/alumni");
const profileRoute = require("./routes/profileRoute");
const passwordRoutes = require("./routes/passwordRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const adminPanel = require("./routes/adminPanel");
const storyRoutes = require("./routes/storyRoutes");
const studentAuthRoutes = require('./routes/studentAuthRoutes');
const referralRoutes = require('./routes/referralRoutes');
const blogRoutes = require('./routes/blogRoutes');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 7034;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(express.json());

const corsOptions = {
  origin: [
    'https://alumni.iiitkota.ac.in',
    'https://www.alumni.iiitkota.ac.in',
    'http://alumni.iiitkota.ac.in',
    'http://www.alumni.iiitkota.ac.in',
    'https://*.alumni.iiitkota.ac.in',
    'http://*.alumni.iiitkota.ac.in',
    'http://*.iiitkota.ac.in',
    'https://*.iiitkota.ac.in',
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 200
};

const io = new Server(httpServer, {
  cors: { origin: corsOptions.origin, credentials: true }
});

require('./sockets/chat')(io);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(`${req.method} ${req.url} - Origin: ${origin}`);
  if (origin && !corsOptions.origin.includes(origin)) {
    console.log('CORS Rejected for origin:', origin);
  }
  next();
});

app.use(cors(corsOptions));
app.use(cookieParser());

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

app.use('/uploads/events', express.static(path.join(__dirname, 'uploads/events')));
app.use('/uploads/resumes', express.static(path.join(__dirname, 'uploads/resumes')));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/alumni", alumniRoutes);
app.use("/api/profile", profileRoute);
app.use("/api/password", passwordRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/register", require("./routes/register"));
app.use("/api/admin", adminPanel);
app.use("/api/stories", storyRoutes);
app.use('/api/student', studentAuthRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/blogs', blogRoutes);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

require('./crons');

module.exports = { app, io };
