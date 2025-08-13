const express = require("express");
const feedbackRouter = express.Router();
const feedbackController = require("../controllers/feedbackController");

// POST: Add feedback
feedbackRouter.post("/", feedbackController.addFeedback);

// GET: All feedbacks for a specific course
feedbackRouter.get(
  "/course/:courseId",
  feedbackController.getFeedbacksByCourse
);

// GET: All feedbacks (admin view)
feedbackRouter.get("/", feedbackController.getAllFeedbacks);

module.exports = feedbackRouter;
