import multer from "multer";
import path from "path";
import fs from "fs";

const getFolderPath = (fieldname) => {
  switch (fieldname) {
    case "profilePhoto":
      return "uploads/trainerProfile/";
    case "idProof":
      return "uploads/trainerIdProof/";
    case "resume":
      return "uploads/trainerResume/";
    default:
      return "uploads/";
  }
};

const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = getFolderPath(file.fieldname);
    ensureDirExists(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "_" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const isValid = allowedTypes.test(file.mimetype.toLowerCase());
  if (isValid) cb(null, true);
  else cb(new Error("Only image and document files are allowed"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export default upload;
