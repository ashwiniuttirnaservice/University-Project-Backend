const mongoose = require("mongoose");
const Note = require("../models/Note");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

// Create Note
exports.createNote = asyncHandler(async (req, res) => {
  const { course, title, content, file, type, duration } = req.body;

  if (!course || !title) {
    return sendError(res, 400, false, "Course and Title are required");
  }

  const note = await Note.create({
    course,
    title,
    content,
    file,
    type,
    duration,
  });

  return sendResponse(res, 201, true, "Note created successfully", note);
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

  return sendResponse(res, 200, true, "All notes fetched successfully", notes);
});

// Get Note by ID
exports.getNoteById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid note ID");
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
    return sendError(res, 404, false, "Note not found");
  }

  return sendResponse(res, 200, true, "Note fetched successfully", note[0]);
});

// Update Note
exports.updateNote = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid note ID");
  }

  const updatedNote = await Note.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedNote) {
    return sendError(res, 404, false, "Note not found");
  }

  return sendResponse(res, 200, true, "Note updated successfully", updatedNote);
});

// Delete Note
exports.deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid note ID");
  }

  const deletedNote = await Note.findByIdAndDelete(id);

  if (!deletedNote) {
    return sendError(res, 404, false, "Note not found");
  }

  return sendResponse(res, 200, true, "Note deleted successfully", null);
});
