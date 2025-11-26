const express = require("express");
const sponsorshipRouter = express.Router();

const upload = require("../utils/multer");
const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");

const sponsorshipController = require("../controllers/sponsorshipController");

sponsorshipRouter.post(
  "/",
  protect,
  checkAccess("sponsorship", "create"),
  upload.single("logo"),
  sponsorshipController.createSponsorship
);

sponsorshipRouter.get(
  "/",
  protect,
  checkAccess("sponsorship", "read"),
  sponsorshipController.getSponsorships
);

sponsorshipRouter.get(
  "/:id",
  protect,
  checkAccess("sponsorship", "read"),
  sponsorshipController.getSponsorshipById
);

sponsorshipRouter.put(
  "/:id",
  protect,
  checkAccess("sponsorship", "update"),
  upload.single("logo"),
  sponsorshipController.updateSponsorship
);

sponsorshipRouter.delete(
  "/:id",
  protect,
  checkAccess("sponsorship", "delete"),
  sponsorshipController.deleteSponsorship
);

module.exports = sponsorshipRouter;
