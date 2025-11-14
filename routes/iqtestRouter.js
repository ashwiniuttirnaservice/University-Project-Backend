const express = require("express");
const {
  getAllIQTests,
  getQuestionsForUser,
  updateUserAnswer,
  submitExam,
  getAllInProgressIQTests,
  getCompletedIQTestsForUser,
} = require("../controllers/iqtestController");

const router = express.Router();

router.get("/all", getAllIQTests);
router.post("/questions", getQuestionsForUser);
router.put("/update-answer", updateUserAnswer);
router.post("/submit", submitExam);
router.post("/in-progress", getAllInProgressIQTests);
router.post("/completed", getCompletedIQTestsForUser);
module.exports = router;
