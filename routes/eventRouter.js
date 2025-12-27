const express = require("express");
const eventRouter = express.Router();

const upload = require("../utils/multer");
const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");

const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");

const eventUploads = upload.fields([
  { name: "bannerImage", maxCount: 1 },
  { name: "gallery", maxCount: 10 },
]);

eventRouter.post(
  "/",
  protect,
  checkAccess("session", "create"),
  eventUploads,
  createEvent
);

eventRouter.get("/", protect, checkAccess("session", "read"), getAllEvents);

eventRouter.get("/:id", protect, checkAccess("session", "read"), getEventById);

eventRouter.put(
  "/:id",
  protect,
  checkAccess("session", "update"),
  eventUploads,
  updateEvent
);

eventRouter.delete(
  "/:id",
  protect,
  checkAccess("session", "delete"),
  deleteEvent
);

module.exports = eventRouter;
