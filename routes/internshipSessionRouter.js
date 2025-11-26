const express = require("express");
const internshipSessionRouter = express.Router();

const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");

const {
  createSession,
  getAllSessions,
  getSessionById,
  updateSession,
  deleteSession,
} = require("../controllers/internshipSessionController");

internshipSessionRouter.post(
  "/",
  protect,
  checkAccess("session", "create"),
  createSession
);

internshipSessionRouter.get(
  "/",
  protect,
  checkAccess("session", "read"),
  getAllSessions
);

internshipSessionRouter.get(
  "/:id",
  protect,
  checkAccess("session", "read"),
  getSessionById
);

internshipSessionRouter.put(
  "/:id",
  protect,
  checkAccess("session", "update"),
  updateSession
);

internshipSessionRouter.delete(
  "/:id",
  protect,
  checkAccess("session", "delete"),
  deleteSession
);

module.exports = internshipSessionRouter;
