const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db.js");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 5001;
dotenv.config();

const app = express();
connectDB();
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const allowedOrigins = [
  "https://uat.codedrift.co",
  "https://www.uat.codedrift.co",
  "https://www.uat-lms.codedrift.co",
  "https://uat-lms.codedrift.co",
  "https://uat-api.codedrift.co",
  "https://www.uat-api.codedrift.co",
  "https://codedrift.co",
  "https://www.codedrift.co",
  "http://localhost:6174",
  "http://localhost:6184",
  "http://localhost:5001",
  "http://localhost:5005",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const indexRouter = require("./routes/index.js");
app.use("/api", indexRouter);

app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () =>
  console.log(`🚀 LMS API running on http://localhost:${PORT}`)
);

process.on("unhandledRejection", (err, promise) => {
  console.error(`Unhandled Rejection: ${err.message}`);
});
