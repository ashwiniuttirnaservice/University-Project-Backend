const express = require("express");
const router = express.Router();

const {
  createSession,
  getAllSessions,
  getSessionById,
  updateSession,
  deleteSession,
} = require("../controllers/internshipSessionController");

// POST /api/internship-sessions/     -> Create new session
router.post("/", createSession);

// GET /api/internship-sessions/      -> Get all sessions
router.get("/", getAllSessions);

// GET /api/internship-sessions/:id  -> Get single session by ID
router.get("/:id", getSessionById);

// PUT /api/internship-sessions/:id  -> Update session by ID
router.put("/:id", updateSession);

// DELETE /api/internship-sessions/:id -> Delete session by ID
router.delete("/:id", deleteSession);

module.exports = router;
