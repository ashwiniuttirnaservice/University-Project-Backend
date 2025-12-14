const mongoose = require("mongoose");
const multer = require("multer");
const xlsx = require("xlsx");
const TestList = require("../models/Test");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");
const Batch = require("../models/Batch");
const storage = multer.memoryStorage();
const uploadMiddleware = multer({ storage }).single("file");

const uploadExcel = asyncHandler(async (req, res) => {
  if (!req.file)
    return sendError(res, 400, false, "Please upload an Excel file");

  const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);

  const {
    title,
    testLevel,
    courseId,
    chapterId,
    batchId,
    phaseId,
    totalMarks,
    passingMarks,
    minutes,
    seconds,
    userType,
  } = req.body;

  if (!courseId)
    return sendError(res, 400, false, "Training Program is required");

  let safeChapterId = chapterId && chapterId !== "" ? chapterId : null;
  let safePhaseId = phaseId && phaseId !== "" ? phaseId : null;
  let safeBatchId = batchId && batchId !== "" ? batchId : null;

  const testDuration = {
    minutes: Number(minutes) || 0,
    seconds: Number(seconds) || 0,
  };

  const totalQuestions = data.length;
  const totalMarksNumber = Number(totalMarks) || totalQuestions;
  const marksPerQuestion = totalMarksNumber / totalQuestions;

  const questions = data.map((row) => ({
    chapterName: row["chapterName"] || "All",
    question: row["question"] || "N/A",
    optionA: row["optionA"] || "N/A",
    optionB: row["optionB"] || "N/A",
    optionC: row["optionC"] || "",
    optionD: row["optionD"] || "",
    correctAns: row["correctAns"] || "A",
    marks: marksPerQuestion,
  }));

  const filter = { title };
  if (safeChapterId) filter.chapterId = safeChapterId;

  const existingTest = await TestList.findOne(filter);

  if (existingTest) {
    // Update existing test
    existingTest.questions = questions;
    existingTest.testLevel = testLevel || existingTest.testLevel;
    existingTest.totalMarks = totalMarksNumber;
    existingTest.passingMarks =
      Number(passingMarks) || existingTest.passingMarks;
    existingTest.totalQuestions = totalQuestions;
    existingTest.testDuration = testDuration;
    existingTest.userType = userType || "0";
    existingTest.phaseId = safePhaseId;
    existingTest.batchId = safeBatchId;
    existingTest.courseId = courseId;
    existingTest.chapterId = safeChapterId;

    await existingTest.save();

    if (safeBatchId) {
      await Batch.findByIdAndUpdate(safeBatchId, {
        $addToSet: { tests: existingTest._id },
      });
    }

    return sendResponse(
      res,
      200,
      true,
      "Assessment updated successfully",
      existingTest
    );
  }

  const newTest = await TestList.create({
    title: title || "Untitled Assessment",
    testLevel: testLevel || "Beginner",
    courseId,
    chapterId: safeChapterId,
    batchId: safeBatchId,
    phaseId: safePhaseId,
    questions,
    testDuration,
    totalMarks: totalMarksNumber,
    passingMarks: Number(passingMarks) || 0,
    totalQuestions,
    userType: userType || "0",
  });

  if (safeBatchId) {
    await Batch.findByIdAndUpdate(safeBatchId, {
      $addToSet: { tests: newTest._id },
    });
  }

  sendResponse(res, 201, true, "Assessment uploaded successfully", newTest);
});

module.exports = { uploadExcel };

const createTest = asyncHandler(async (req, res) => {
  const {
    phaseId,
    batchId,
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

  if (!courseId)
    return sendError(res, 400, false, "Training Program is required");

  if (!batchId || !mongoose.Types.ObjectId.isValid(batchId)) {
    return sendError(res, 400, false, "Valid batchId is required");
  }

  // ✅ Calculate marks per question if totalMarks given
  let finalTotalQuestions =
    totalQuestions || (Array.isArray(questions) ? questions.length : 0);

  let finalTotalMarks = Number(totalMarks) || finalTotalQuestions;
  let marksPerQuestion =
    finalTotalQuestions > 0 ? finalTotalMarks / finalTotalQuestions : 1;

  // Assign equal marks to each question
  const updatedQuestions = questions.map((q) => ({
    ...q,
    marks: marksPerQuestion,
  }));

  const newTest = await TestList.create({
    phaseId,
    batchId,
    courseId,
    chapterId,
    title: title || "Untitled Assessment",
    questions: updatedQuestions,
    testDuration: {
      minutes: testDuration?.minutes || 0,
      seconds: testDuration?.seconds || 0,
    },
    totalQuestions: finalTotalQuestions,
    totalMarks: finalTotalMarks,
    passingMarks: passingMarks || 0,
    userType: userType || "0",
    reportType: reportType || 1,
  });

  await Batch.findByIdAndUpdate(batchId, {
    $push: { tests: newTest._id },
  });

  sendResponse(res, 201, true, "Assessment created successfully", newTest);
});

const getAllTests = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.user.role === "trainer") {
    const trainerBatchIds = await Batch.find({
      trainer: req.user.trainerId,
    }).distinct("_id");

    filter.batchId = { $in: trainerBatchIds };
  }

  const tests = await TestList.find(filter).sort({ createdAt: -1 });

  if (!tests || tests.length === 0) {
    return sendResponse(res, 200, true, "No Assessment found", []);
  }

  return sendResponse(
    res,
    200,
    true,
    "All Assessment fetched successfully",
    tests
  );
});

const getQuestionsForAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) return sendError(res, 400, false, "Assessment  ID is required");

  const test = await TestList.findById(id).select("title questions").lean();
  if (!test) return sendError(res, 404, false, "Assessment  not found");

  sendResponse(res, 200, true, "Questions fetched successfully", test);
});

const deleteTestById = asyncHandler(async (req, res) => {
  const deleted = await TestList.findByIdAndDelete(req.params.id);
  if (!deleted) return sendError(res, 404, false, "Assessment  not found");

  sendResponse(res, 200, true, "Assessment  deleted successfully", deleted);
});

const getTestListForAdmin = asyncHandler(async (req, res) => {
  const { chapterId, phaseId, batchId } = req.body;

  const filter = {};

  if (chapterId && mongoose.Types.ObjectId.isValid(chapterId)) {
    filter.chapterId = new mongoose.Types.ObjectId(chapterId);
  }

  if (phaseId && mongoose.Types.ObjectId.isValid(phaseId)) {
    filter.phaseId = new mongoose.Types.ObjectId(phaseId);
  }

  if (batchId && mongoose.Types.ObjectId.isValid(batchId)) {
    filter.batchId = new mongoose.Types.ObjectId(batchId);
  }

  const result = await TestList.find(filter, { questions: 0 }).sort({
    createdAt: -1,
  });

  if (!result.length)
    return sendResponse(
      res,
      200,
      true,
      "No Assessment found for given filters",
      []
    );

  sendResponse(res, 200, true, "Assessment  fetched successfully", result);
});

const getTestsByBatchId = asyncHandler(async (req, res) => {
  const { batchId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(batchId)) {
    return sendError(res, 400, false, "Invalid Batch ID");
  }

  const tests = await TestList.find({ batchId: batchId, visible: true })
    .select(
      "_id title testLevel totalQuestions totalMarks passingMarks testDuration userType reportType createdAt"
    )
    .sort({ createdAt: -1 });

  if (!tests || tests.length === 0) {
    return sendError(res, 404, false, "No tests found for this batch");
  }

  return sendResponse(res, 200, true, "Tests fetched successfully", tests);
});

module.exports = {
  uploadMiddleware,
  uploadExcel,
  createTest,
  getQuestionsForAdmin,
  deleteTestById,
  getTestListForAdmin,
  getAllTests,
  getTestsByBatchId,
};
