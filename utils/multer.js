const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Return folder path based on fieldname
const getFolderPath = (fieldname) => {
  switch (fieldname) {
    case "Logo":
      return "uploads/contact/logo/";
    case "profilePhotoTrainer":
      return "uploads/trainer/trainer-profilephoto/";
    case "idProofTrainer":
      return "uploads/trainer/trainer-idproof/";
    case "resume":
      return "uploads/trainer/trainer-resume/";
    case "profilePhotoStudent":
      return "uploads/student/student-profilephoto/";
    case "idProofStudent":
      return "uploads/student/student-idproof/";
    case "notes":
    case "file":
      return "uploads/course-notes/";
    case "testExcel":
      return "uploads/test-excel/";
    case "bannerImage":
      return "uploads/events/banner/";
    case "gallery":
      return "uploads/events/gallery/";
    case "speakerPhoto":
      return "uploads/webinar/speakers/";
    case "profile":
      return "uploads/feedback/profiles/";
    case "logo":
      return "uploads/sponsorship/logo/";
    case "contentUrl":
      return "uploads/lectures/";
    case "fileUrl":
      return "uploads/assignments/";
    case "certificate":
      return "uploads/iqtests/certificates/";
    case "report":
      return "uploads/iqtests/reports/";
    default:
      throw new Error(`Invalid file field: ${fieldname}`);
  }
};

// Ensure directory exists
const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const folder = getFolderPath(file.fieldname);
      ensureDirExists(folder);
      cb(null, folder);
    } catch (err) {
      cb(new Error("Invalid file field: " + file.fieldname));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "_" + uniqueSuffix + ext);
  },
});

// Allowed MIME types
const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "application/x-zip-compressed",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "video/mp4",
  "video/mov",
  "video/avi",
  "video/mkv",
];

// File filter
const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image, document, zip, and Excel files are allowed"));
  }
};

// Multer upload
const upload = multer({
  storage,
  fileFilter,
  fileSize: 1024 * 1024 * 10,
});

module.exports = upload;
