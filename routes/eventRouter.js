const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");
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

router.post("/", eventUploads, createEvent);
router.get("/", getAllEvents);
router.get("/:id", getEventById);
router.put("/:id", eventUploads, updateEvent);
router.delete("/:id", deleteEvent);

module.exports = router;
