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
  checkAccess("event", "create"),
  eventUploads,
  createEvent
);

eventRouter.get("/", protect, checkAccess("event", "read"), getAllEvents);

eventRouter.get("/:id", protect, checkAccess("event", "read"), getEventById);

eventRouter.put(
  "/:id",
  protect,
  checkAccess("event", "update"),
  eventUploads,
  updateEvent
);

eventRouter.delete(
  "/:id",
  protect,
  checkAccess("event", "delete"),
  deleteEvent
);

module.exports = eventRouter;
