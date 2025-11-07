const express = require("express");
const router = express.Router();
const sponsorshipController = require("../controllers/sponsorshipController");
const upload = require("../utils/multer");

router.post(
  "/",
  upload.single("logo"),
  sponsorshipController.createSponsorship
);

router.get("/", sponsorshipController.getSponsorships);

router.get("/:id", sponsorshipController.getSponsorshipById);

router.put(
  "/:id",
  upload.single("logo"),
  sponsorshipController.updateSponsorship
);

router.delete("/:id", sponsorshipController.deleteSponsorship);

module.exports = router;
