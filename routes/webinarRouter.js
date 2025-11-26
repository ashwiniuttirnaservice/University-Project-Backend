const express = require("express");
const webinarRouter = express.Router();

const webinarController = require("../controllers/webinarController");
const upload = require("../utils/multer");
const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");

webinarRouter.post(
  "/",
  protect,
  checkAccess("webinar", "create"),
  upload.single("speakerPhoto"),
  webinarController.createWebinar
);

webinarRouter.get(
  "/",
  protect,
  checkAccess("webinar", "read"),
  webinarController.getAllWebinars
);

webinarRouter.get(
  "/:id",
  protect,
  checkAccess("webinar", "read"),
  webinarController.getWebinarById
);

webinarRouter.put(
  "/:id",
  protect,
  checkAccess("webinar", "update"),
  upload.single("speakerPhoto"),
  webinarController.updateWebinar
);

webinarRouter.delete(
  "/:id",
  protect,
  checkAccess("webinar", "delete"),
  webinarController.deleteWebinar
);

module.exports = webinarRouter;
