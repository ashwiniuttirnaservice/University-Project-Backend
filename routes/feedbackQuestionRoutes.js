const express = require("express");
const router = express.Router();

const {
  createFeedbackQuestion,
  getAllFeedbackQuestions,
  getFeedbackQuestionById,
  updateFeedbackQuestion,
  deleteFeedbackQuestion,
} = require("../controllers/feedbackQuestionController");

router.post("/", createFeedbackQuestion);
router.get("/", getAllFeedbackQuestions);
router.get("/:id", getFeedbackQuestionById);
router.put("/:id", updateFeedbackQuestion);
router.delete("/:id", deleteFeedbackQuestion);

module.exports = router;
