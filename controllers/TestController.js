const mongoose = require("mongoose");
const multer = require("multer");
const xlsx = require("xlsx");
const TestList = require("../models/Test");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

const storage = multer.memoryStorage();
const uploadMiddleware = multer({ storage }).single("file");

const uploadExcel = asyncHandler(async (req, res) => {
  if (!req.file)
    return sendError(res, 400, false, "Please upload an Excel file");

  const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);

  const questions = data.map((row) => ({
    question: row["question"] || "N/A",
    optionA: row["optionA"] || "N/A",
    optionB: row["optionB"] || "N/A",
    optionC: row["optionC"] || "N/A",
    optionD: row["optionD"] || "N/A",
    correctAns: row["correctAns"] || "A",
    marks: Number(row["marks"]) || 1,
  }));

  const totalMarks = Number(req.body.totalMarks) || questions.length;
  const testDuration = {
    minutes: Number(req.body.minutes) || 0,
    seconds: Number(req.body.seconds) || 0,
  };
  const userType = req.body.userType || "0";

  let test = await TestList.findOne({ title: req.body.title });

  if (test) {
    test.questions = questions;
    test.userType = userType;
    test.totalMarks = totalMarks;
    await test.save();
    return sendResponse(res, 200, true, "IQ Test updated successfully", test);
  }

  const newTest = await TestList.create({
    title: req.body.title || "Untitled Test",
    testLevel: req.body.testLevel || "Beginner",
    questions,
    testDuration,
    userType,
    totalMarks,
  });

  sendResponse(res, 201, true, "IQ Test uploaded successfully", newTest);
});

const createTest = asyncHandler(async (req, res) => {
  const {
    courseId,
    chapterId,
    title,
    questions,
    testDuration,
    totalQuestions,
    totalMarks,
    passingMarks,
    userType,
    reportType,
  } = req.body;

  if (!chapterId) return sendError(res, 400, false, "chapterId is required");

  const newTest = await TestList.create({
    courseId,
    chapterId,
    title: title || "Untitled Test",
    questions,
    testDuration: {
      minutes: testDuration?.minutes || 0,
      seconds: testDuration?.seconds || 0,
    },
    totalQuestions:
      totalQuestions || (Array.isArray(questions) ? questions.length : 0),
    totalMarks: totalMarks || 0,
    passingMarks: passingMarks || 0,
    userType: userType || "0",
    reportType: reportType || 0,
  });

  sendResponse(res, 201, true, "Test created successfully", newTest);
});

const getQuestionsForAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) return sendError(res, 400, false, "IQ Test ID is required");

  const test = await TestList.findById(id).select("title questions").lean();
  if (!test) return sendError(res, 404, false, "IQ Test not found");

  sendResponse(res, 200, true, "Questions fetched successfully", test);
});

const deleteTestById = asyncHandler(async (req, res) => {
  const deleted = await TestList.findByIdAndDelete(req.params.id);
  if (!deleted) return sendError(res, 404, false, "Test not found");

  sendResponse(res, 200, true, "Test deleted successfully", deleted);
});

const getTestListForAdmin = asyncHandler(async (req, res) => {
  const { type } = req.body;
  const result = await TestList.find(
    { chapterId: new mongoose.Types.ObjectId(type) },
    { questions: 0 }
  );

  sendResponse(res, 200, true, "Tests fetched successfully", result);
});

module.exports = {
  uploadMiddleware,
  uploadExcel,
  createTest,
  getQuestionsForAdmin,
  deleteTestById,
  getTestListForAdmin,
};
