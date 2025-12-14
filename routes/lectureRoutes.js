const express = require("express");
const lectureRouter = express.Router();

const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");
const roleFilter = require("../middleware/roleFilter");
const lectureController = require("../controllers/lectureController");
const upload = require("../utils/multer");

lectureRouter.post(
  "/",
  protect,
  checkAccess("lecture", "create"),
  upload.single("contentUrl"),
  lectureController.createMultipleLectures
);

lectureRouter.post(
  "/:lectureId/clone",
  // protect,
  // checkAccess("lecture", "create"),
  upload.single("contentUrl"),
  lectureController.cloneLecture
);

lectureRouter.get(
  "/course/:courseId",
  protect,
  checkAccess("lecture", "read"),
  lectureController.getLecturesByCourse
);

lectureRouter.get(
  "/",
  protect,
  roleFilter,
  checkAccess("lecture", "read"),
  lectureController.getAllLectures
);

lectureRouter.get(
  "/:id",
  protect,
  checkAccess("lecture", "read"),
  lectureController.getLectureById
);

lectureRouter.put(
  "/:id",
  protect,
  checkAccess("lecture", "update"),
  upload.single("contentUrl"),
  lectureController.updateLecture
);

lectureRouter.delete(
  "/:id",
  protect,
  checkAccess("lecture", "delete"),
  lectureController.deleteLecture
);

module.exports = lectureRouter;
