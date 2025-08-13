const Feedback = require("../models/Feedback");
const { sendResponse, sendError } = require("../utils/apiResponse");
const asyncHandler = require("../middleware/asyncHandler");

// Submit feedback (student)
exports.submitFeedback = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return sendError(res, 400, false, "All fields are required.");
  }

  const feedback = new Feedback({ name, email, message });
  await feedback.save();

  return sendResponse(
    res,
    201,
    true,
    "Feedback submitted successfully.",
    feedback
  );
});

// Get all feedback (admin only)
exports.getAllFeedback = asyncHandler(async (req, res) => {
  const feedbacks = await Feedback.find().sort({ createdAt: -1 });
  return sendResponse(
    res,
    200,
    true,
    "Feedback fetched successfully.",
    feedbacks
  );
});
