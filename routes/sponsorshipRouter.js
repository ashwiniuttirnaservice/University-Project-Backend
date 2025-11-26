const express = require("express");
const sponsorshipRouter = express.Router();

const upload = require("../utils/multer");
const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");

const sponsorshipController = require("../controllers/sponsorshipController");

sponsorshipRouter.post(
  "/",
  protect,
  checkAccess("session", "create"),
  upload.single("logo"),
  sponsorshipController.createSponsorship
);

sponsorshipRouter.get(
  "/",
  protect,
  checkAccess("session", "read"),
  sponsorshipController.getSponsorships
);

sponsorshipRouter.get(
  "/:id",
  protect,
  checkAccess("session", "read"),
  sponsorshipController.getSponsorshipById
);

sponsorshipRouter.put(
  "/:id",
  protect,
  checkAccess("session", "update"),
  upload.single("logo"),
  sponsorshipController.updateSponsorship
);

sponsorshipRouter.delete(
  "/:id",
  protect,
  checkAccess("session", "delete"),
  sponsorshipController.deleteSponsorship
);

module.exports = sponsorshipRouter;
