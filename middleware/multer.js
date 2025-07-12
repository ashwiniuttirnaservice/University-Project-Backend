import multer from "multer";
import path from "path";
import fs from "fs";

// Define and ensure upload folder exists
const uploadPath = "uploads/syllabusPdfs";
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = `syllabus_${Date.now()}${ext}`;
    cb(null, fileName);
  },
});

// File filter for PDF only
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

// Export the configured multer instance
const pdfUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
});

export default pdfUpload;
