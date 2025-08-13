const Feedback = require("../models/Feedback");
const { sendResponse, sendError } = require("../utils/apiResponse");
const asyncHandler = require("../middleware/asyncHandler");

// @desc    Add new feedback for a course
// @route   POST /api/feedbacks
exports.addFeedback = asyncHandler(async (req, res) => {
  const feedback = new Feedback(req.body);
  await feedback.save();
  sendResponse(res, 201, "Feedback added successfully", feedback);
});

// @desc    Get all feedbacks for a specific course
// @route   GET /api/feedbacks/course/:courseId
exports.getFeedbacksByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const feedbacks = await Feedback.find({ courseId });

  if (!feedbacks.length) {
    return sendError(res, 404, "No feedbacks found for this course");
  }

  sendResponse(res, 200, "Feedbacks fetched successfully", {
    courseId,
    totalFeedbacks: feedbacks.length,
    feedbacks,
  });
});

// @desc    Get all feedbacks (Admin / Overall view)
// @route   GET /api/feedbacks
exports.getAllFeedbacks = asyncHandler(async (req, res) => {
  const feedbacks = await Feedback.find().populate(
    "courseId",
    "title description"
  );

  if (!feedbacks.length) {
    return sendError(res, 404, "No feedbacks found");
  }

  sendResponse(res, 200, "All feedbacks fetched successfully", {
    total: feedbacks.length,
    feedbacks,
  });
});
