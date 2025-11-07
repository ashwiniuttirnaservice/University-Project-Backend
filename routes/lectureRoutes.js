const express = require("express");
const router = express.Router();
const lectureController = require("../controllers/lectureController");
const upload = require("../utils/multer");

router.post(
  "/",
  upload.array("contentUrl", 10),
  lectureController.createMultipleLectures
);

router.get("/course/:courseId", lectureController.getLecturesByCourse);

router.get("/", lectureController.getAllLectures);
router.get("/:id", lectureController.getLectureById);
router.put(
  "/:id",
  upload.single("contentUrl"),
  lectureController.updateLecture
);
router.delete("/:id", lectureController.deleteLecture);

module.exports = router;
