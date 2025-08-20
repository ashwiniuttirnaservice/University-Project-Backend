const Feedback = require("../models/Feedback");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

// 📌 Create Feedback
exports.createFeedback = asyncHandler(async (req, res) => {
  try {
    const {
      courseId,
      fullName,
      mobileNo,
      email,
      collegeName,
      message,
      rating,
    } = req.body;

    const feedback = new Feedback({
      courseId,
      fullName,
      mobileNo,
      email,
      collegeName,
      message,
      rating,
      // ✅ फक्त relative path save करायचा
      profile: req.file ? req.file.filename : null,
    });

    await feedback.save();
    return sendResponse(
      res,
      201,
      true,
      "Feedback submitted successfully",
      feedback
    );
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

// 📌 Get all feedback
exports.getAllFeedback = asyncHandler(async (req, res) => {
  const feedbacks = await Feedback.find().populate(
    "courseId",
    "title description"
  );
  return sendResponse(res, 200, true, "Feedback fetched", feedbacks);
});

// 📌 Get feedback by course
exports.getFeedbackByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const feedbacks = await Feedback.find({ courseId }).populate(
    "courseId",
    "title"
  );
  return sendResponse(res, 200, true, "Course feedback fetched", feedbacks);
});
