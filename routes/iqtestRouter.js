const express = require("express");
const iqtestRouter = express.Router();

const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");

const {
  getAllIQTests,
  getQuestionsForUser,
  updateUserAnswer,
  submitExam,
  getAllInProgressIQTests,
  getCompletedIQTestsForUser,
} = require("../controllers/iqtestController");

iqtestRouter.get("/all", protect, checkAccess("test", "read"), getAllIQTests);

iqtestRouter.post(
  "/questions",
  protect,
  checkAccess("test", "read"),
  getQuestionsForUser
);

iqtestRouter.put(
  "/update-answer",
  protect,
  checkAccess("test", "update"),
  updateUserAnswer
);

iqtestRouter.post(
  "/submit",
  protect,
  checkAccess("test", "create"),
  submitExam
);

iqtestRouter.post(
  "/in-progress",
  protect,
  checkAccess("test", "read"),
  getAllInProgressIQTests
);

iqtestRouter.post(
  "/completed",
  protect,
  checkAccess("test", "read"),
  getCompletedIQTestsForUser
);

module.exports = iqtestRouter;
