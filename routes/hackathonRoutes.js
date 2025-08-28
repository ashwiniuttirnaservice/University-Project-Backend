const express = require("express");
const router = express.Router();
const hackathonController = require("../controllers/hackathonController");

// Create Hackathon
router.post("/", hackathonController.createHackathon);

// Get All Hackathons
router.get("/", hackathonController.getAllHackathons);

// Get Hackathon by ID
router.get("/:id", hackathonController.getHackathonById);

// Update Hackathon
router.put("/:id", hackathonController.updateHackathon);

// Delete Hackathon
router.delete("/:id", hackathonController.deleteHackathon);

module.exports = router;
