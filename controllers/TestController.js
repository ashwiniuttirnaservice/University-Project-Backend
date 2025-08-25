const Test = require("../models/Test.js");
const Result = require("../models/Result.js");
const asyncHandler = require("../middleware/asyncHandler.js");
const mongoose = require("mongoose");
const { sendResponse, sendError } = require("../utils/apiResponse");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

// @desc    Get all tests
const getAllTests = asyncHandler(async (req, res) => {
  const tests = await Test.aggregate([
    {
      $lookup: {
        from: "courses",
        localField: "course",
        foreignField: "_id",
        as: "courseDetails",
      },
    },
    { $unwind: "$courseDetails" },
    {
      $lookup: {
        from: "branches",
        localField: "branch",
        foreignField: "_id",
        as: "branchDetails",
      },
    },
    { $unwind: "$branchDetails" },
    { $sort: { createdAt: -1 } },
    {
      $project: {
        title: 1,
        duration: 1,
        questions: 1,
        createdAt: 1,
        course: "$courseDetails.title",
        branch: "$branchDetails.name",
      },
    },
  ]);

  return sendResponse(res, 200, true, "All tests fetched.", tests);
});

// @desc    Get single test by ID
const getTestById = asyncHandler(async (req, res) => {
  const [test] = await Test.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
  ]);

  if (!test) return sendError(res, 404, false, "Test not found with this ID");
  return sendResponse(res, 200, true, "Test found.", test);
});

// @desc    Get tests for a specific course
const getTestsForCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(courseId))
    return sendResponse(res, 200, true, "", []);

  const tests = await Test.aggregate([
    { $match: { course: new mongoose.Types.ObjectId(courseId) } },
  ]);

  return sendResponse(res, 200, true, "Tests for course fetched.", tests);
});

// @desc    Create a new test
const createTest = asyncHandler(async (req, res) => {
  const { title, course, branch, duration, questions } = req.body;

  if (!title || !course || !branch || !questions || questions.length === 0) {
    return sendError(
      res,
      400,
      false,
      "Provide title, course, branch, and at least one question."
    );
  }

  if (!req.user) return sendError(res, 401, false, "Not authorized.");

  const transformedQuestions = questions.map((q) => {
    if (!q.correctAnswer || !q.options || !Array.isArray(q.options)) {
      throw new Error("Each question must have options and a correct answer.");
    }

    const correctOptionIndex = q.options.findIndex(
      (opt) => opt === q.correctAnswer
    );
    if (correctOptionIndex === -1) {
      throw new Error(
        `Correct answer "${q.correctAnswer}" not among options for "${q.questionText}"`
      );
    }

    return {
      questionText: q.questionText,
      options: q.options,
      correctOption: correctOptionIndex,
    };
  });

  const createdTest = await Test.create({
    title,
    course,
    branch,
    duration,
    questions: transformedQuestions,
    createdBy: req.user._id,
  });

  return sendResponse(res, 201, true, "Test created.", createdTest);
});

const importTestsFromExcel = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendError(res, 400, false, "Excel file not provided.");
  }

  const filePath = path.join(__dirname, "../", req.file.path);
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);

  if (!Array.isArray(rows) || rows.length === 0) {
    fs.unlinkSync(filePath);
    return sendError(res, 400, false, "Excel sheet is empty or invalid.");
  }

  const testsToCreate = rows.map((row, rowIndex) => {
    try {
      const questions = JSON.parse(row.questions);
      const correctAnswer = JSON.parse(row.correctAnswer);

      const transformedQuestions = questions.map((q, index) => {
        const correctOptionIndex = q.options.findIndex(
          (opt) => opt === correctAnswer[index]
        );
        return {
          questionText: q.questionText,
          options: q.options,
          correctOption: correctOptionIndex,
        };
      });

      return {
        title: row.title,
        duration: Number(row.duration),
        course: row.course,
        branch: row.branch,
        questions: transformedQuestions,
        createdBy: req.user._id,
      };
    } catch (err) {
      throw new Error(`Invalid format in row ${rowIndex + 2}`);
    }
  });

  const inserted = await Test.insertMany(testsToCreate);
  fs.unlinkSync(filePath);
  return sendResponse(res, 201, true, "Tests imported successfully.", inserted);
});

const updateTest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = {
    ...(req.body.title && { title: req.body.title }),
    ...(req.body.course && { course: req.body.course }),
    ...(req.body.branch && { branch: req.body.branch }),
    ...(req.body.questions && { questions: req.body.questions }),
    ...(req.body.duration && { duration: req.body.duration }),
  };

  const updated = await Test.findByIdAndUpdate(id, updateData, { new: true });
  if (!updated) return sendError(res, 404, false, "Test not found.");
  return sendResponse(res, 200, true, "Test updated.", updated);
});

const deleteTest = asyncHandler(async (req, res) => {
  const test = await Test.findByIdAndDelete(req.params.id);
  if (!test) return sendError(res, 404, false, "Test not found.");
  return sendResponse(res, 200, true, "Test deleted successfully.");
});

const submitTest = asyncHandler(async (req, res) => {
  const { testId, answers } = req.body;
  const studentId = req.user._id;

  const test = await Test.findById(testId);
  if (!test) return sendError(res, 404, false, "Test not found.");

  let score = 0;
  const totalMarks = test.questions.length;
  const studentAnswers = [];

  test.questions.forEach((q, i) => {
    const selected = answers[i];
    studentAnswers.push({
      question: q._id,
      selectedOption: selected,
    });
    if (selected != null && q.correctOption === selected) score++;
  });

  const result = await Result.create({
    student: studentId,
    test: testId,
    score,
    totalMarks,
    answers: studentAnswers,
  });

  return sendResponse(res, 201, true, "Test submitted successfully.", {
    score,
    totalMarks,
  });
});

// @desc    Get results for logged-in student
const getTestResults = asyncHandler(async (req, res) => {
  const results = await Result.aggregate([
    { $match: { student: new mongoose.Types.ObjectId(req.user._id) } },
    {
      $lookup: {
        from: "tests",
        localField: "test",
        foreignField: "_id",
        as: "testDetails",
      },
    },
    { $unwind: "$testDetails" },
    { $sort: { submittedAt: -1 } },
    {
      $project: {
        score: 1,
        totalMarks: 1,
        submittedAt: 1,
        testTitle: "$testDetails.title",
      },
    },
  ]);

  return sendResponse(res, 200, true, "Student test results.", results);
});

// @desc    Get single result by ID
const getSingleTestResult = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return sendError(res, 400, false, "Invalid result ID format.");

  const [result] = await Result.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        from: "tests",
        localField: "test",
        foreignField: "_id",
        as: "testDetails",
      },
    },
    { $unwind: "$testDetails" },
  ]);

  if (!result) return sendError(res, 404, false, "Result not found.");

  if (
    result.student.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return sendError(res, 403, false, "Unauthorized to view this result.");
  }

  return sendResponse(res, 200, true, "Result fetched.", result);
});

// @desc    Admin - Get all student results
const getAllStudentResults = asyncHandler(async (req, res) => {
  const results = await Result.aggregate([
    {
      $lookup: {
        from: "tests",
        localField: "test",
        foreignField: "_id",
        as: "testDetails",
      },
    },
    { $unwind: "$testDetails" },
    {
      $lookup: {
        from: "users",
        localField: "student",
        foreignField: "_id",
        as: "studentDetails",
      },
    },
    { $unwind: "$studentDetails" },
    { $sort: { submittedAt: -1 } },
    {
      $project: {
        score: 1,
        totalMarks: 1,
        submittedAt: 1,
        testTitle: "$testDetails.title",
        student: {
          _id: "$studentDetails._id",
          firstName: "$studentDetails.firstName",
          lastName: "$studentDetails.lastName",
          email: "$studentDetails.email",
        },
      },
    },
  ]);

  return sendResponse(res, 200, true, "All student results.", results);
});

module.exports = {
  createTest,
  getAllTests,
  getTestById,
  updateTest,
  deleteTest,
  getTestsForCourse,
  submitTest,
  getTestResults,
  getSingleTestResult,
  getAllStudentResults,
  importTestsFromExcel,
};
