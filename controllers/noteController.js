const mongoose = require("mongoose");
const Note = require("../models/Note");
const Chapter = require("../models/Chapter");
const Batch = require("../models/Batch");
const { sendResponse, sendError } = require("../utils/apiResponse");
const asyncHandler = require("../middleware/asyncHandler");

exports.createNote = asyncHandler(async (req, res) => {
  const { course, chapter, title, content, batches } = req.body;

  if (!title) {
    return sendError(res, 400, false, "Title is required");
  }

  if (chapter && mongoose.Types.ObjectId.isValid(chapter)) {
    const chapterExists = await Chapter.findById(chapter);
    if (!chapterExists) {
      return sendError(res, 404, false, "Chapter not found");
    }
  }

  const batchArray = batches
    ? Array.isArray(batches)
      ? batches
      : [batches]
    : [];

  const note = await Note.create({
    course,
    chapter: chapter || null,
    title,
    content,
    file: req.file ? req.file.filename : null,
    batches: batchArray,
    uploadedAt: new Date(),
  });

  if (chapter && mongoose.Types.ObjectId.isValid(chapter)) {
    await Chapter.findByIdAndUpdate(chapter, {
      $push: { notes: note._id },
    });
  }

  if (batchArray.length > 0) {
    await Batch.updateMany(
      { _id: { $in: batchArray } },
      { $push: { notes: note._id } }
    );
  }

  return sendResponse(res, 201, true, "Note created successfully", note);
});

exports.getAllNotes = asyncHandler(async (req, res) => {
  const matchQuery = { isActive: true };

  if (req.user?.role === "trainer") {
    const trainerCourseIds = await Batch.find({
      trainer: req.user.trainerId,
    }).distinct("coursesAssigned");

    matchQuery.course = { $in: trainerCourseIds };
  }

  const notes = await Note.aggregate([
    { $match: matchQuery },

    {
      $lookup: {
        from: "chapters",
        localField: "chapter",
        foreignField: "_id",
        as: "chapter",
      },
    },

    { $unwind: { path: "$chapter", preserveNullAndEmptyArrays: true } },

    { $sort: { uploadedAt: -1 } },
  ]);

  return sendResponse(res, 200, true, "Notes fetched successfully", notes);
});

exports.getNotesByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return sendError(res, 400, false, "Invalid Course ID");
  }

  const notes = await Note.aggregate([
    {
      $lookup: {
        from: "chapters",
        localField: "chapter",
        foreignField: "_id",
        as: "chapterData",
      },
    },
    { $unwind: { path: "$chapterData", preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: "weeks",
        localField: "chapterData.week",
        foreignField: "_id",
        as: "weekData",
      },
    },
    { $unwind: { path: "$weekData", preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: "phases",
        localField: "weekData.phase",
        foreignField: "_id",
        as: "phaseData",
      },
    },
    { $unwind: { path: "$phaseData", preserveNullAndEmptyArrays: true } },

    {
      $match: {
        "phaseData.course": new mongoose.Types.ObjectId(courseId),
      },
    },

    {
      $project: {
        _id: 1,
        title: 1,
        file: 1,
        uploadedAt: 1,
        "chapterData._id": 1,
        "chapterData.title": 1,
      },
    },

    { $sort: { uploadedAt: -1 } },
  ]);

  if (!notes.length) {
    return sendError(res, 404, false, "No notes found for this course");
  }

  return sendResponse(res, 200, true, "Notes fetched successfully", notes);
});

exports.getNoteById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid note ID");
  }

  const note = await Note.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },

    {
      $lookup: {
        from: "chapters",
        localField: "chapter",
        foreignField: "_id",
        as: "chapter",
      },
    },
    { $unwind: { path: "$chapter", preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: "modules",
        localField: "chapter.module",
        foreignField: "_id",
        as: "chapter.moduleDetails",
      },
    },
    {
      $unwind: {
        path: "$chapter.moduleDetails",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: "courses",
        localField: "chapter.course",
        foreignField: "_id",
        as: "chapter.courseDetails",
      },
    },
    {
      $unwind: {
        path: "$chapter.courseDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
  ]);

  if (!note.length) {
    return sendError(res, 404, false, "Note not found");
  }

  return sendResponse(res, 200, true, "Note fetched successfully", note[0]);
});

exports.updateNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content, chapter } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid note ID");
  }

  const updateData = {};

  if (title !== undefined) updateData.title = title;
  if (content !== undefined) updateData.content = content;

  if (chapter === null || mongoose.Types.ObjectId.isValid(chapter)) {
    updateData.chapter = chapter;
  }

  if (req.file) updateData.file = req.file.filename;

  const note = await Note.findByIdAndUpdate(id, updateData, { new: true });

  if (!note) {
    return sendError(res, 404, false, "Note not found");
  }

  return sendResponse(res, 200, true, "Note updated successfully", note);
});

exports.deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid Note ID");
  }

  const note = await Note.findById(id);
  if (!note) {
    return sendError(res, 404, false, "Note not found");
  }

  note.isActive = false;
  await note.save();

  return sendResponse(res, 200, true, "Note deleted successfully");
});

exports.cloneNote = asyncHandler(async (req, res) => {
  const { noteId } = req.body;

  if (!noteId || !mongoose.Types.ObjectId.isValid(noteId)) {
    return sendError(res, 400, false, "Valid noteId is required");
  }

  const originalNote = await Note.findById(noteId);
  if (!originalNote) {
    return sendError(res, 404, false, "Note not found");
  }

  const clonedNote = await Note.create({
    course: originalNote.course,
    chapter: originalNote.chapter || null,
    title: originalNote.title + " (Copy)",
    content: originalNote.content,
    file: originalNote.file,
    isActive: originalNote.isActive,
    uploadedAt: new Date(),
    batches: originalNote.batches,
  });

  if (originalNote.chapter) {
    await Chapter.findByIdAndUpdate(originalNote.chapter, {
      $push: { notes: clonedNote._id },
    });
  }

  return sendResponse(res, 201, true, "Note cloned successfully", clonedNote);
});
