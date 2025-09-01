const mongoose = require("mongoose");
const Note = require("../models/Note");
const Course = require("../models/Course");
const { sendResponse, sendError } = require("../utils/apiResponse");
const asyncHandler = require("../middleware/asyncHandler");

exports.createNote = asyncHandler(async (req, res) => {
  const { course, title, content, duration } = req.body;

  if (!course || !title) {
    return sendError(res, 400, false, "Course and Title are required");
  }

  const courseExists = await Course.findById(course);
  if (!courseExists) {
    return sendError(res, 404, false, "Course not found");
  }

  const note = await Note.create({
    course,
    title,
    content,
    file: req.file ? `${req.file.filename}` : null,
    duration,
    uploadedAt: new Date(),
  });

  return sendResponse(res, 201, true, "Note created successfully", note);
});

exports.getAllNotes = asyncHandler(async (req, res) => {
  const notes = await Note.aggregate([
    {
      $lookup: {
        from: "courses",
        localField: "course",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },
    { $sort: { uploadedAt: -1 } },
  ]);

  return sendResponse(res, 200, true, "Notes fetched successfully", notes);
});

exports.getNoteById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const note = await Note.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        from: "courses",
        localField: "course",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },
  ]);

  if (!note.length) return sendError(res, 404, false, "Note not found");

  return sendResponse(res, 200, true, "Note fetched successfully", note[0]);
});

exports.updateNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content, duration } = req.body;

  let updateData = { title, content, duration };
  if (req.file) {
    updateData.file = `/uploads/course-notes/${req.file.filename}`;
  }

  const note = await Note.findByIdAndUpdate(id, updateData, { new: true });
  if (!note) return sendError(res, 404, false, "Note not found");

  return sendResponse(res, 200, true, "Note updated successfully", note);
});

exports.deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const note = await Note.findByIdAndDelete(id);
  if (!note) return sendError(res, 404, false, "Note not found");

  return sendResponse(res, 200, true, "Note deleted successfully", null);
});
