const mongoose = require("mongoose");
const Note = require("../models/Note");
const Chapter = require("../models/Chapter");
const { sendResponse, sendError } = require("../utils/apiResponse");
const asyncHandler = require("../middleware/asyncHandler");

exports.createNote = asyncHandler(async (req, res) => {
  const { course, chapter, title, content } = req.body;

  if (!chapter || !title) {
    return sendError(res, 400, false, "Chapter and Title are required");
  }

  const chapterExists = await Chapter.findById(chapter);
  if (!chapterExists) {
    return sendError(res, 404, false, "Chapter not found");
  }

  const note = await Note.create({
    chapter,
    course,
    title,
    content,
    file: req.file ? `${req.file.filename}` : null,
    uploadedAt: new Date(),
  });

  await Chapter.findByIdAndUpdate(chapter, {
    $push: { notes: note._id },
  });

  return sendResponse(res, 201, true, "Note created successfully", note);
});

exports.getAllNotes = asyncHandler(async (req, res) => {
  const notes = await Note.aggregate([
    {
      $match: { isActive: true },
    },

    {
      $lookup: {
        from: "chapters",
        localField: "chapter",
        foreignField: "_id",
        as: "chapter",
      },
    },

    { $unwind: "$chapter" },

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
    { $unwind: "$chapterData" },

    {
      $lookup: {
        from: "weeks",
        localField: "chapterData.week",
        foreignField: "_id",
        as: "weekData",
      },
    },
    { $unwind: "$weekData" },

    {
      $lookup: {
        from: "phases",
        localField: "weekData.phase",
        foreignField: "_id",
        as: "phaseData",
      },
    },
    { $unwind: "$phaseData" },

    {
      $match: {
        "phaseData.course": new mongoose.Types.ObjectId(courseId),
      },
    },

    {
      $project: {
        _id: 1,
        title: 1,
        fileUrl: 1,
        uploadedAt: 1,
        description: 1,
        "chapterData._id": 1,
        "chapterData.title": 1,
      },
    },

    { $sort: { uploadedAt: -1 } },
  ]);

  if (!notes.length) {
    return sendError(res, 404, false, "No notes found for this course");
  }

  return sendResponse(
    res,
    200,
    true,
    "Notes fetched successfully for the given course",
    notes
  );
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
    {
      $unwind: {
        path: "$chapter",
        preserveNullAndEmptyArrays: true,
      },
    },
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
    {
      $project: {
        _id: 1,
        title: 1,
        content: 1,
        file: 1,
        uploadedAt: 1,
        createdAt: 1,
        updatedAt: 1,
        __v: 1,
        chapter: {
          _id: 1,
          chapterName: 1,
          description: 1,
          moduleDetails: {
            _id: 1,
            moduleName: 1,
          },
          courseDetails: {
            _id: 1,
            courseName: 1,
          },
        },
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

  let updateData = { title, content };
  if (chapter) updateData.chapter = chapter;
  if (req.file) updateData.file = `${req.file.filename}`;

  const note = await Note.findByIdAndUpdate(id, updateData, { new: true });
  if (!note) return sendError(res, 404, false, "Note not found");

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

  await note.deleteOne();

  return sendResponse(res, 200, true, "Note deleted successfully");
});
