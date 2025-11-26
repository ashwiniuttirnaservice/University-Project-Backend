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
  checkAccess("internshipSession", "create"),
  createSession
);

internshipSessionRouter.get(
  "/",
  protect,
  checkAccess("internshipSession", "read"),
  getAllSessions
);

internshipSessionRouter.get(
  "/:id",
  protect,
  checkAccess("internshipSession", "read"),
  getSessionById
);

internshipSessionRouter.put(
  "/:id",
  protect,
  checkAccess("internshipSession", "update"),
  updateSession
);

internshipSessionRouter.delete(
  "/:id",
  protect,
  checkAccess("internshipSession", "delete"),
  deleteSession
);

module.exports = internshipSessionRouter;
