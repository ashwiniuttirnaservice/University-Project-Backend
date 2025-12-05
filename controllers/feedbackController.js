const Feedback = require("../models/Feedback");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

exports.createFeedback = asyncHandler(async (req, res) => {
  try {
    let {
      studentId,
      trainerId,
      courseId,
      batchId,
      fullName,
      email,
      mobileNo,
      questions,
      suggestions,
      trainerFeedback,
      npsScore,
    } = req.body;

    if (typeof questions === "string") {
      try {
        questions = JSON.parse(questions);
      } catch (err) {
        return sendError(res, 400, false, "Invalid questions JSON format");
      }
    }

    const nps = {
      score: npsScore ? Number(npsScore) : null,
    };

    const feedback = new Feedback({
      studentId,
      trainerId,
      courseId,
      batchId,
      fullName,
      email,
      mobileNo,
      questions,
      suggestions,
      trainerFeedback,
      nps,
      profile: req.file ? req.file.filename : null,
    });

    await feedback.save();

    const totalScore = feedback.questions.reduce(
      (sum, q) => sum + (q.numericValue ?? 0),
      0
    );

    const averageScore =
      feedback.questions.length > 0
        ? totalScore / feedback.questions.length
        : 0;

    return sendResponse(res, 201, true, "Feedback submitted successfully", {
      feedback,
      totalScore,
      averageScore,
      npsScore: nps.score ?? null,
    });
  } catch (error) {
    return sendError(res, 400, error.message);
  }
});

exports.getAllFeedback = asyncHandler(async (req, res) => {
  const feedbacks = await Feedback.find({ isActive: true })
    .populate("studentId", "firstName lastName email mobileNo")
    .populate("trainerId", "fullName email")
    .populate("courseId", "title description")
    .populate("batchId", "batchName timing");

  return sendResponse(res, 200, true, "All feedback fetched", feedbacks);
});

exports.getFeedbackByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const feedbacks = await Feedback.find({ courseId })
    .populate("studentId", "firstName lastName")
    .populate("trainerId", "firstName lastName")
    .populate("courseId", "title")
    .populate("batchId", "batchName");

  return sendResponse(res, 200, true, "Course feedback fetched", feedbacks);
});

exports.getFeedbackByBatch = asyncHandler(async (req, res) => {
  const { batchId } = req.params;

  const feedbacks = await Feedback.find({ batchId })
    .populate("studentId")
    .populate("trainerId")
    .populate("courseId");

  return sendResponse(res, 200, true, "Batch feedback fetched", feedbacks);
});

exports.getFeedbackByStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const feedbacks = await Feedback.find({ studentId })
    .populate("courseId", "title")
    .populate("batchId", "batchName");

  return sendResponse(res, 200, true, "Student feedback fetched", feedbacks);
});

exports.deleteFeedback = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deleted = await Feedback.findByIdAndDelete(id);

  if (!deleted) {
    return sendError(res, 404, "Feedback not found");
  }

  return sendResponse(res, 200, true, "Feedback deleted successfully", null);
});
