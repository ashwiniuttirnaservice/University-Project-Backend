const express = require("express");
const videoLectureRouter = express.Router();

const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");

const {
  createVideoLecture,
  getAllVideoLectures,
  getVideoLectureById,
  updateVideoLecture,
  deleteVideoLecture,
} = require("../controllers/videoController");

videoLectureRouter.post(
  "/",
  protect,
  checkAccess("videoLecture", "create"),
  createVideoLecture
);

videoLectureRouter.get(
  "/",
  protect,
  checkAccess("videoLecture", "read"),
  getAllVideoLectures
);

videoLectureRouter.get(
  "/:id",
  protect,
  checkAccess("videoLecture", "read"),
  getVideoLectureById
);

videoLectureRouter.put(
  "/:id",
  protect,
  checkAccess("videoLecture", "update"),
  updateVideoLecture
);

videoLectureRouter.delete(
  "/:id",
  protect,
  checkAccess("videoLecture", "delete"),
  deleteVideoLecture
);

module.exports = videoLectureRouter;
