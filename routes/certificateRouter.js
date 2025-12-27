const express = require("express");
const {
  uploadCertificateAndReport,
  getIQTestDetails,
} = require("../controllers/certificateController");
const upload = require("../utils/multer");

const router = express.Router();

router.post(
  "/upload-certificate-report",
  upload.fields([
    { name: "certificate", maxCount: 1 },
    { name: "report", maxCount: 1 },
  ]),
  uploadCertificateAndReport
);

router.post("/details", getIQTestDetails);

module.exports = router;
