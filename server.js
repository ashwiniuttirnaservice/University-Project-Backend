const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db.js");
const cookieParser = require("cookie-parser");
const faceapi = require("face-api.js");

const indexRouter = require("./routes/index.js");

// Load environment variables

dotenv.config();
// --- Models ko load karne ka function ---
async function loadModels() {
  console.log("Loading Face-API models...");
  try {
    // Models ko 'backend/models' directory se load karein
    const modelPath = path.join(__dirname, "models");
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
    console.log("Face-API models loaded successfully.");
  } catch (error) {
    console.error("Error loading Face-API models:", error);
    // Agar model load na ho to server ko band kar dein
    process.exit(1);
  }
}

// Database connection
connectDB();

const app = express();

// --- CORS Middleware ---
const corsOptions = {
  origin: "http://localhost:5174", // Aapka frontend ka URL
  credentials: true, // Cookies ke liye zaroori
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(cookieParser());

// --- Body Parser Middleware ---
// JSON payload ke size ko badhayein (face-api base64 string ke liye)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/api", indexRouter); // Now available as: /api/trainer/* and /api/student/*

// --- ROUTES KO REGISTER KAREIN ---
// <-- Feedback route register

// Simple root route
app.get("/", (req, res) => {
  res.send("LMS API is alive and running...");
});

// Static folder for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Basic Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5001;

// --- Server start karne se pehle models load karein ---
loadModels().then(() => {
  app.listen(PORT, () =>
    console.log(`🚀 LMS API running on http://localhost:${PORT}`)
  );
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error(`Unhandled Rejection: ${err.message}`);
});
