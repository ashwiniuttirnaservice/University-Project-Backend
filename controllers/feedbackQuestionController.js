const mongoose = require("mongoose");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");
const FeedbackQuestion = require("../models/FeedbackQuestion");

exports.createFeedbackQuestion = asyncHandler(async (req, res) => {
  const { courseId, batchId, title, questions } = req.body;

  if (!courseId || !batchId || !title || !questions || questions.length === 0) {
    return sendError(res, 400, false, "All fields are required");
  }

  const payload = {
    courseId,
    batchId,
    title,
    questions,
    createdBy: req.user?.id || null,
  };

  const created = await FeedbackQuestion.create(payload);

  return sendResponse(res, 201, true, "Feedback questions created", created);
});

exports.getAllFeedbackQuestions = asyncHandler(async (req, res) => {
  const results = await FeedbackQuestion.aggregate([
    {
      $lookup: {
        from: "courses",
        localField: "courseId",
        foreignField: "_id",
        as: "course",
      },
    },

    { $unwind: "$course" },

    {
      $lookup: {
        from: "batches",
        localField: "batchId",
        foreignField: "_id",
        as: "batch",
      },
    },
    { $unwind: "$batch" },

    {
      $lookup: {
        from: "admins",
        localField: "createdBy",
        foreignField: "_id",
        as: "creator",
      },
    },
    { $unwind: { path: "$creator", preserveNullAndEmptyArrays: true } },

    {
      $project: {
        title: 1,
        questions: 1,
        isActive: 1,
        createdAt: 1,
        updatedAt: 1,
        course: { _id: 1, title: 1 },
        batch: { _id: 1, batchName: 1 },
        creator: { _id: 1, fullName: 1, email: 1 },
      },
    },
  ]);

  return sendResponse(res, 200, true, "All feedback questions", results);
});

exports.getFeedbackQuestionById = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const result = await FeedbackQuestion.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },

    {
      $lookup: {
        from: "courses",
        localField: "courseId",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },

    {
      $lookup: {
        from: "batches",
        localField: "batchId",
        foreignField: "_id",
        as: "batch",
      },
    },
    { $unwind: "$batch" },

    {
      $project: {
        title: 1,
        questions: 1,
        isActive: 1,
        course: { _id: 1, title: 1 },
        batch: { _id: 1, batchName: 1 },
      },
    },
  ]);

  if (!result || result.length === 0) {
    return sendError(res, 404, false, "Feedback questions not found");
  }

  return sendResponse(res, 200, true, "Feedback question found", result[0]);
});

exports.updateFeedbackQuestion = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const updated = await FeedbackQuestion.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  if (!updated) {
    return sendError(res, 404, false, "Feedback question not found");
  }

  return sendResponse(res, 200, true, "Feedback question updated", updated);
});

exports.deleteFeedbackQuestion = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const deleted = await FeedbackQuestion.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!deleted) {
    return sendError(res, 404, false, "Feedback question not found");
  }

  return sendResponse(res, 200, true, "Feedback question deleted", deleted);
});
