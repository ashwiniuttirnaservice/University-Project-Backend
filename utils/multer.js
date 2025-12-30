const multer = require("multer");
const path = require("path");
const fs = require("fs");

const getFolderPath = (fieldname) => {
  switch (fieldname) {
    case "CompanyLogo":
      return "uploads/contact/company-logo/";
    case "trainingPlan":
      return "uploads/course/training-plan/";
    case "courseImage":
      return "uploads/course/";
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
    case "labs":
      return "uploads/cloudLabs/";
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
    case "submissionFile":
      return "uploads/assignment-submissions/initial/";

    case "files":
      return "uploads/assignment-submissions/resubmit/";

    case "mistakePhotos":
      return "uploads/assignment-submissions/mistakes/";
    case "excelFile":
      return "uploads/excel/";
    case "materialFiles":
      return "uploads/prerequisite/materials/";
    case "projectSubmission":
      return "uploads/projects/submissions/";

    default:
      throw new Error(`Invalid file field: ${fieldname}`);
  }
};

const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

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
const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "application/zip",
  "application/x-zip-compressed",
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image, document, zip, and Excel files are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  fileSize: 1024 * 1024 * 10,
});

module.exports = upload;
