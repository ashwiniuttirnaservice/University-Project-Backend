const express = require("express");
const router = express.Router();
const webinarController = require("../controllers/webinarController");
const upload = require("../utils/multer");

// Create webinar (with photo upload)
router.post(
  "/",
  upload.single("speakerPhoto"),
  webinarController.createWebinar
);

// Get all webinars
router.get("/", webinarController.getAllWebinars);

// Get webinar by ID
router.get("/:id", webinarController.getWebinarById);

// Update webinar (with photo upload)
router.put(
  "/:id",
  upload.single("speakerPhoto"),
  webinarController.updateWebinar
);

// Delete webinar
router.delete("/:id", webinarController.deleteWebinar);

module.exports = router;
