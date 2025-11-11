const mongoose = require("mongoose");
const IQTest = require("../models/IqTest");
const TestList = require("../models/Test");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

const getAllIQTests = asyncHandler(async (req, res) => {
  const student = req.student;
  const { type } = req.query;

  let match = {};
  if (type && type !== "all")
    match.chapterId = new mongoose.Types.ObjectId(type);

  const result = await TestList.aggregate([
    { $match: match },
    {
      $lookup: {
        from: "iqtests",
        let: { testID: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$testID", "$$testID"] },
                  { $eq: ["$studentId", student?.data] },
                ],
              },
            },
          },
        ],
        as: "userAttempts",
      },
    },
    { $addFields: { attempted: { $gt: [{ $size: "$userAttempts" }, 0] } } },
  ]);

  const formatted = result.map((test) => ({
    _id: test._id,
    title: test.title,
    totalMarks: test.totalMarks,
    attempted: test.attempted
      ? test.userAttempts[0]?.status <= 0
        ? -1
        : 1
      : 0,
    createdAt: test.createdAt,
  }));

  sendResponse(res, 200, true, "Tests fetched successfully", formatted);
});

const getQuestionsForUser = asyncHandler(async (req, res) => {
  const { testID, studentId } = req.body;
  if (!testID || !studentId)
    return sendError(res, 400, false, "testID and studentId are required");

  let iqTest = await IQTest.findOne(
    { testID, studentId },
    { "questions.correctAns": 0 }
  );

  if (iqTest) {
    if (iqTest.status === 1)
      return sendError(res, 400, false, "Test already completed");

    return sendResponse(res, 200, true, "Test resumed successfully", iqTest);
  }

  const test = await TestList.findById(testID);
  if (!test) return sendError(res, 404, false, "Test not found");

  const sampled = await TestList.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(testID) } },
    { $unwind: "$questions" },
    { $sample: { size: test.totalQuestions } },
    {
      $project: {
        _id: "$questions._id",
        question: "$questions.question",
        optionA: "$questions.optionA",
        optionB: "$questions.optionB",
        optionC: "$questions.optionC",
        optionD: "$questions.optionD",
        correctAns: "$questions.correctAns",
        selectedOption: null,
      },
    },
  ]);

  const newTest = await IQTest.create({
    studentId,
    testID,
    title: test.title,
    status: 0,
    testDuration: test.testDuration,
    totalQuestions: test.totalQuestions,
    passingMarks: test.passingMarks,
    questions: sampled,
  });

  sendResponse(res, 200, true, "Questions fetched successfully", newTest);
});

const updateUserAnswer = asyncHandler(async (req, res) => {
  const {
    iqTestId,
    studentId,
    testID,
    questionId,
    selectedOption,
    status,
    testDuration,
  } = req.body;

  if (!iqTestId || !studentId || !testID || !questionId)
    return sendError(res, 400, false, "Required fields missing");

  await IQTest.updateOne(
    { studentId, testID, "questions._id": questionId },
    {
      $set: {
        "questions.$.selectedOption": selectedOption,
        status,
        testDuration,
      },
    }
  );

  sendResponse(res, 200, true, "Answer updated successfully");
});

const submitExam = asyncHandler(async (req, res) => {
  const { testID, studentId, testDuration } = req.body;

  const iqTest = await IQTest.findOne({ testID, studentId });
  if (!iqTest) return sendError(res, 404, false, "IQ Test not found");

  let correct = 0,
    wrong = 0,
    marks = 0;

  iqTest.questions.forEach((q) => {
    if (q.correctAns === q.selectedOption) {
      correct++;
      marks += Number(q.marks || 0);
    } else if (q.selectedOption) wrong++;
  });

  const totalMarks = iqTest.questions.reduce(
    (a, q) => a + Number(q.marks || 0),
    0
  );

  const testList = await TestList.findById(testID);

  await IQTest.updateOne(
    { testID, studentId },
    {
      $set: {
        correctAnswers: correct,
        wrongAnswers: wrong,
        marksGained: marks,
        totalMarks,
        passingMarks: testList?.passingMarks || 0,
        status: 1,
        testDuration,
      },
    }
  );

  sendResponse(res, 200, true, "Exam submitted successfully", {
    correct,
    wrong,
    marks,
    totalMarks,
    passingMarks: testList?.passingMarks || 0,
  });
});

module.exports = {
  getAllIQTests,
  getQuestionsForUser,
  updateUserAnswer,
  submitExam,
};
