const express = require("express");
const iqtestRouter = express.Router();

const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");

const {
  getAllIQTests,
  getQuestionsForUser,
  updateUserAnswer,
  getAllResultsByTestId,
  submitExam,
  getAllInProgressIQTests,
  getCompletedIQTestsForUser,
} = require("../controllers/iqtestController");

iqtestRouter.get("/all", protect, checkAccess("test", "read"), getAllIQTests);

iqtestRouter.post(
  "/questions",

  getQuestionsForUser
);

iqtestRouter.put(
  "/update-answer",

  updateUserAnswer
);

iqtestRouter.get(
  "/:testId",

  getAllResultsByTestId
);

iqtestRouter.post(
  "/submit",

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

  getCompletedIQTestsForUser
);

module.exports = iqtestRouter;
