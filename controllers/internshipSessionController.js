const InternshipSession = require("../models/InternshipSession");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

exports.createSession = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    startDate,
    endDate,
    duration,
    mode,
    location,
    topics,
    capacity,
    fees,
    certification,
    status,
  } = req.body;

  const session = await InternshipSession.create({
    title,
    description,
    startDate,
    endDate,
    duration,
    mode,
    location,
    topics,
    capacity,
    fees,
    certification,
    status,
  });

  return sendResponse(res, 201, true, "Internship session created", session);
});

exports.getAllSessions = asyncHandler(async (req, res) => {
  const sessions = await InternshipSession.find().sort({ createdAt: -1 });
  return sendResponse(
    res,
    200,
    true,
    "All internship sessions fetched",
    sessions
  );
});

exports.getSessionById = asyncHandler(async (req, res) => {
  const session = await InternshipSession.findById(req.params.id);
  if (!session) return sendError(res, 404, "Internship session not found");

  return sendResponse(res, 200, true, "Internship session fetched", session);
});

exports.updateSession = asyncHandler(async (req, res) => {
  const session = await InternshipSession.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!session) return sendError(res, 404, "Internship session not found");

  return sendResponse(res, 200, true, "Internship session updated", session);
});

exports.deleteSession = asyncHandler(async (req, res) => {
  const session = await InternshipSession.findByIdAndDelete(req.params.id);
  if (!session) return sendError(res, 404, "Internship session not found");

  return sendResponse(res, 200, true, "Internship session deleted", session);
});
