const mongoose = require("mongoose");
const Note = require("../models/Note");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

// Create Note
exports.createNote = asyncHandler(async (req, res) => {
  const { course, title, content, file, type, duration } = req.body;

  if (!course || !title) {
    return sendError(res, "Course and Title are required", 400);
  }

  const note = await Note.create({
    course,
    title,
    content,
    file,
    type,
    duration,
  });

  sendResponse(res, note, "Note created successfully");
});

// Get All Notes (Aggregation with course details)
exports.getAllNotes = asyncHandler(async (req, res) => {
  const notes = await Note.aggregate([
    {
      $lookup: {
        from: "courses",
        localField: "course",
        foreignField: "_id",
        as: "courseDetails",
      },
    },
    { $unwind: "$courseDetails" },
    { $sort: { uploadedAt: -1 } },
  ]);

  sendResponse(res, notes, "All notes fetched successfully");
});

// Get Note by ID
exports.getNoteById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, "Invalid note ID", 400);
  }

  const note = await Note.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        from: "courses",
        localField: "course",
        foreignField: "_id",
        as: "courseDetails",
      },
    },
    { $unwind: "$courseDetails" },
  ]);

  if (!note.length) {
    return sendError(res, "Note not found", 404);
  }

  sendResponse(res, note[0], "Note fetched successfully");
});

// Update Note
exports.updateNote = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, "Invalid note ID", 400);
  }

  const updatedNote = await Note.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedNote) {
    return sendError(res, "Note not found", 404);
  }

  sendResponse(res, updatedNote, "Note updated successfully");
});

// Delete Note
exports.deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, "Invalid note ID", 400);
  }

  const deletedNote = await Note.findByIdAndDelete(id);

  if (!deletedNote) {
    return sendError(res, "Note not found", 404);
  }

  sendResponse(res, null, "Note deleted successfully");
});
