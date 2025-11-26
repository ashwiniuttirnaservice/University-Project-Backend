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

iqtestRouter.get("/all", protect, checkAccess("iqtest", "read"), getAllIQTests);

iqtestRouter.post(
  "/questions",
  protect,
  checkAccess("iqtest", "read"),
  getQuestionsForUser
);

iqtestRouter.put(
  "/update-answer",
  protect,
  checkAccess("iqtest", "update"),
  updateUserAnswer
);

iqtestRouter.post(
  "/submit",
  protect,
  checkAccess("iqtest", "create"),
  submitExam
);

iqtestRouter.post(
  "/in-progress",
  protect,
  checkAccess("iqtest", "read"),
  getAllInProgressIQTests
);

iqtestRouter.post(
  "/completed",
  protect,
  checkAccess("iqtest", "read"),
  getCompletedIQTestsForUser
);

module.exports = iqtestRouter;
