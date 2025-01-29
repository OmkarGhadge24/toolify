const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");

dotenv.config();
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!require('fs').existsSync(uploadsDir)) {
  require('fs').mkdirSync(uploadsDir);
}

// Routes
const contactRoutes = require("./routes/contactRoutes");
const authRoutes = require("./routes/authRoutes");
const backgroundRemoverRoutes = require("./routes/backgroundRemover");
const ocrRoutes = require("./routes/textExtractorRoutes");
const fileConverterRoutes = require("./routes/fileConverterRoutes");

app.use("/api/contacts", contactRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", backgroundRemoverRoutes);
app.use("/api", ocrRoutes);
app.use("/api", fileConverterRoutes);

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/toolify");
    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    setTimeout(connectDB, 5000);
  }
};

connectDB();

app.get("/", (req, res) => {
  res.send("Welcome to the Main Page");
});

app.get("/profile", (req, res) => {
  const user = {
    isLoggedIn: true,
    name: "John Doe",
    email: "johndoe@example.com",
    gender: "male",
  };
  res.json(user);
});

app.get("/contactus", (req, res) => {
  res.send("Contact Us page - Backend");
});

app.post("/contactus", (req, res) => {
  const { name, age, country, email, description } = req.body;

  if (!name || !age || !country || !email || !description) {
    return res.status(400).json({ error: "All fields are required" });
  }
  res
    .status(200)
    .json({ message: "Form submitted successfully", data: req.body });
});

app.get("/about", (req, res) => {
  res.send("About page - Backend");
});

app.get("/others", (req, res) => {
  res.send("Others page - Backend");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop other processes using this port.`);
  } else {
    console.error('Server error:', err);
  }
});
