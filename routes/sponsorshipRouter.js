// routes/sponsorshipRouter.js
const express = require("express");
const router = express.Router();
const sponsorshipController = require("../controllers/sponsorshipController");

// Create sponsorship
router.post("/", sponsorshipController.createSponsorship);

// Get all sponsorships
router.get("/", sponsorshipController.getSponsorships);

// Get single sponsorship by ID
router.get("/:id", sponsorshipController.getSponsorshipById);

// Update sponsorship by ID
router.put("/:id", sponsorshipController.updateSponsorship);

// Delete sponsorship by ID
router.delete("/:id", sponsorshipController.deleteSponsorship);

module.exports = router;
