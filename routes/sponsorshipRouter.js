// routes/sponsorshipRouter.js
const express = require("express");
const router = express.Router();
const sponsorshipController = require("../controllers/sponsorshipController");
const upload = require("../utils/multer");

// Create sponsorship (with logo upload)
router.post(
  "/",
  upload.single("logo"),
  sponsorshipController.createSponsorship
);

// Get all sponsorships
router.get("/", sponsorshipController.getSponsorships);

// Get single sponsorship by ID
router.get("/:id", sponsorshipController.getSponsorshipById);

// Update sponsorship by ID (allow logo upload also)
router.put(
  "/:id",
  upload.single("logo"),
  sponsorshipController.updateSponsorship
);

// Delete sponsorship by ID
router.delete("/:id", sponsorshipController.deleteSponsorship);

module.exports = router;
