const Feedback = require("../models/Feedback");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

exports.createFeedback = asyncHandler(async (req, res) => {
  try {
    let {
      studentId,
      trainerId,
      feedbackQuestionId,
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
      feedbackQuestionId,
      batchId,
      fullName,
      email,
      mobileNo,
      questions,
      suggestions,
      trainerFeedback,
      status: 1,
      nps,
      profile: req.file ? req.file.filename : null,
    });

    await feedback.save();

    const totalScore = feedback.questions.reduce(
      (sum, q) => sum + (q.numericValue ?? 0),
      0,
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

exports.getAllFeedback1 = asyncHandler(async (req, res) => {
  const feedbacks = await Feedback.find({ isActive: true })
    .populate("studentId", "firstName lastName email mobileNo")
    .populate("trainerId", "fullName email")
    .populate("courseId", "title description")
    .populate("batchId", "batchName timing")
    .sort({ createdAt: -1 });

  return sendResponse(res, 200, true, "All feedback fetched", feedbacks);
});
exports.getAllFeedback = asyncHandler(async (req, res) => {
  let finalFilter = { isActive: true };

  if (req.roleFilter?.trainer) {
    finalFilter.trainerId = req.roleFilter.trainer;
  }

  if (req.roleFilter?.["batches.students"]) {
    finalFilter["batches.students"] = req.roleFilter["batches.students"];
  }

  const feedbacks = await Feedback.find(finalFilter)
    .populate("studentId", "firstName lastName email mobileNo")
    .populate("trainerId", "fullName email")
    .populate("courseId", "title description")
    .populate("batchId", "batchName timing")
    .sort({ createdAt: -1 });

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

const ExcelJS = require("exceljs");

const mongoose = require("mongoose");

exports.downloadStudentFeedbackExcel = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid studentId",
      });
    }

    const feedback = await Feedback.findOne({ studentId })
      .populate("studentId", "fullName")
      .populate("courseId", "courseName")
      .populate("batchId", "batchName")
      .populate("trainerId", "name")
      .lean();

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "No feedback found for student",
      });
    }

    const workbook = new ExcelJS.Workbook();

    const answerLabel = {
      strongly_agree: "Strongly Agree",
      agree: "Agree",
      disagree: "Disagree",
      cant_say: "Can't Say",
    };

    const summarySheet = workbook.addWorksheet("Feedback Summary");

    summarySheet.columns = [
      { header: "Field", key: "field", width: 40 },
      { header: "Details", key: "value", width: 30 },
    ];

    const totalScore = feedback.questions.reduce(
      (sum, q) => sum + (q.numericValue || 0),
      0,
    );

    const avgScore = (totalScore / feedback.questions.length).toFixed(1);

    summarySheet.addRows([
      {
        field: "Student Name",
        value: feedback.studentId?.fullName || "Student",
      },
      { field: "Course", value: feedback.courseId?.courseName || "-" },
      { field: "Batch", value: feedback.batchId?.batchName || "-" },
      { field: "Trainer", value: feedback.trainerId?.name || "-" },
      {
        field: "Feedback Submitted Date",
        value: new Date(feedback.createdAt).toLocaleDateString("en-IN"),
      },
      { field: "Score", value: avgScore },

      {
        field: feedback.nps?.question || "NPS – Recommendation Score",
        value: feedback.nps?.score ?? "-",
      },
    ]);

    const qaSheet = workbook.addWorksheet("Questions & Answers");

    qaSheet.columns = [
      { header: "Question", key: "question", width: 55 },
      { header: "Your Answer", key: "answer", width: 22 },
    ];

    feedback.questions.forEach((q) => {
      qaSheet.addRow({
        question: q.question,
        answer: answerLabel[q.answer] || q.answer,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=student_feedback.xlsx",
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to download student feedback",
    });
  }
};

exports.submitFeedback = asyncHandler(async (req, res, next) => {
  const { fullName, collegeName, trainerId, values, description } = req.body;

  const feedbackData = {
    fullName,
    collegeName,
    trainerId,
    questions: values,
    suggestions: description,
    status: 1,
  };

  const feedback = await Feedback.create(feedbackData);

  if (!feedback) {
    return sendError(res, 400, false, "Feedback save karta aale nahi");
  }

  return sendResponse(
    res,
    201,
    true,
    "Feedback यशस्वीरीत्या जमा झाले!",
    feedback,
  );
});
