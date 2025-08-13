const express = require("express");
const feedbackRouter = express.Router();
const feedbackController = require("../controllers/feedbackController");

// POST /api/feedback - submit feedback
feedbackRouter.post("/", feedbackController.submitFeedback);

// GET /api/feedback - get all feedback (admin only)
feedbackRouter.get("/", feedbackController.getAllFeedback);

module.exports = feedbackRouter;
