const express = require("express");
const router = express.Router();

const {
  createFeedbackQuestion,
  cloneFeedbackQuestion,
  getAllFeedbackQuestions,
  getFeedbackQuestionById,
  updateFeedbackQuestion,
  deleteFeedbackQuestion,
} = require("../controllers/feedbackQuestionController");
router.post("/:originalId/clone", cloneFeedbackQuestion);
router.post("/", createFeedbackQuestion);
router.get("/", getAllFeedbackQuestions);
router.get("/:id", getFeedbackQuestionById);
router.put("/:id", updateFeedbackQuestion);
router.delete("/:id", deleteFeedbackQuestion);

module.exports = router;
