const express = require("express");
const webinarRouter = express.Router();

const webinarController = require("../controllers/webinarController");
const upload = require("../utils/multer");
const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");

webinarRouter.post(
  "/",
  protect,
  checkAccess("session", "create"),
  upload.single("speakerPhoto"),
  webinarController.createWebinar
);

webinarRouter.get(
  "/",
  protect,
  checkAccess("session", "read"),
  webinarController.getAllWebinars
);

webinarRouter.get(
  "/:id",
  protect,
  checkAccess("session", "read"),
  webinarController.getWebinarById
);

webinarRouter.put(
  "/:id",
  protect,
  checkAccess("session", "update"),
  upload.single("speakerPhoto"),
  webinarController.updateWebinar
);

webinarRouter.delete(
  "/:id",
  protect,
  checkAccess("session", "delete"),
  webinarController.deleteWebinar
);

module.exports = webinarRouter;
