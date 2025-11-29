const express = require("express");
const router = express.Router();

const prerequisiteProgressController = require("../controllers/prerequisiteProgressController");

router.post("/", prerequisiteProgressController.updatePrerequisiteProgress);
router.get(
  "/progress/:courseId",
  prerequisiteProgressController.getCoursePrerequisiteProgress
);

router.get(
  "/report/excel/:courseId",
  prerequisiteProgressController.generatePrerequisiteExcelReport
);
// router.get(
//   "/report/pdf/:courseId",
//   prerequisiteProgressController.generatePrerequisitePdfReport
// );

module.exports = router;
