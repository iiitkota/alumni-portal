require("dotenv").config(); // Load environment variables
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require('path');
const cookieParser = require("cookie-parser");


const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const alumniRoutes = require("./routes/alumni");
const profileRoute = require("./routes/profileRoute"); // Ensure this is the correct path
const passwordRoutes = require("./routes/passwordRoutes"); // Import the password routes
const verificationRoutes = require("./routes/verificationRoutes"); // Add this line

const adminPanel = require("./routes/adminPanel")

const app = express();
const PORT = process.env.PORT || 7034;
const MONGODB_URI = process.env.MONGODB_URI; // MongoDB URI from .env

app.use(express.json());
const corsOptions = {
	// origin: "http://localhost:5173"
	origin: [
		'https://alumni.iiitkota.ac.in',
		'https://www.alumni.iiitkota.ac.in',
		'http://alumni.iiitkota.ac.in',
		'http://www.alumni.iiitkota.ac.in',
		'https://*.alumni.iiitkota.ac.in',
		'http://*.alumni.iiitkota.ac.in',
		'http://*.iiitkota.ac.in',
		'https://*.iiitkota.ac.in', 
	]
	
	
	
	, 
	methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
	credentials: true,
	optionsSuccessStatus: 200
};

// Add CORS debugging middleware
app.use((req, res, next) => {
    const origin = req.headers.origin;
    console.log('Request Origin:', origin);
    if (origin && !corsOptions.origin.includes(origin)) {
        console.log('CORS Rejected for origin:', origin);
    }
    next();
});

app.use(cors(corsOptions));

app.use(cookieParser());

// Connect to MongoDB
mongoose
.connect(MONGODB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log("Connected to MongoDB"))
	.catch((err) => console.error("Failed to connect to MongoDB", err));

// Use routes
app.use('/uploads/events', express.static(path.join(__dirname, 'uploads/events')));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/alumni", alumniRoutes);
app.use("/api/profile", profileRoute);
app.use("/api/password", passwordRoutes); // Add the password routes
app.use("/api/verification", verificationRoutes); // Add this line
app.use("/api/register", require("./routes/register"));



app.use("/api/admin", adminPanel)

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});