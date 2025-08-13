const InternshipSession = require("../models/InternshipSession");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

// Create a new internship session
const createSession = asyncHandler(async (req, res) => {
  try {
    const session = new InternshipSession(req.body);
    await session.save();
    return sendResponse(
      res,
      201,
      true,
      "Internship session created successfully",
      session
    );
  } catch (error) {
    return sendError(res, 400, false, error.message);
  }
});

// Get all sessions
const getAllSessions = asyncHandler(async (req, res) => {
  try {
    const sessions = await InternshipSession.find()
      .populate("trainer", "fullName email")
      .populate("participants", "fullName email")
      .populate("feedback.student", "fullName email");
    return sendResponse(
      res,
      200,
      true,
      "Internship sessions fetched successfully",
      sessions
    );
  } catch (error) {
    return sendError(res, 500, false, error.message);
  }
});

// Get single session by ID
const getSessionById = asyncHandler(async (req, res) => {
  try {
    const session = await InternshipSession.findById(req.params.id)
      .populate("trainer", "fullName email")
      .populate("participants", "fullName email")
      .populate("feedback.student", "fullName email");

    if (!session) {
      return sendError(res, 404, false, "Session not found");
    }
    return sendResponse(
      res,
      200,
      true,
      "Session fetched successfully",
      session
    );
  } catch (error) {
    return sendError(res, 500, false, error.message);
  }
});

// Update a session
const updateSession = asyncHandler(async (req, res) => {
  try {
    const session = await InternshipSession.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!session) {
      return sendError(res, 404, false, "Session not found");
    }
    return sendResponse(
      res,
      200,
      true,
      "Session updated successfully",
      session
    );
  } catch (error) {
    return sendError(res, 400, false, error.message);
  }
});

// Delete a session
const deleteSession = asyncHandler(async (req, res) => {
  try {
    const session = await InternshipSession.findByIdAndDelete(req.params.id);

    if (!session) {
      return sendError(res, 404, false, "Session not found");
    }
    return sendResponse(res, 200, true, "Session deleted successfully");
  } catch (error) {
    return sendError(res, 500, false, error.message);
  }
});

module.exports = {
  createSession,
  getAllSessions,
  getSessionById,
  updateSession,
  deleteSession,
};
