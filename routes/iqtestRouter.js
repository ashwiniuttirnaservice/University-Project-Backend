const express = require("express");
const {
  getAllIQTests,
  getQuestionsForUser,
  updateUserAnswer,
  submitExam,
} = require("../controllers/iqtestController");

const router = express.Router();

router.get("/all", getAllIQTests);

router.post("/questions", getQuestionsForUser);

router.post("/update-answer", updateUserAnswer);

router.post("/submit", submitExam);

module.exports = router;
