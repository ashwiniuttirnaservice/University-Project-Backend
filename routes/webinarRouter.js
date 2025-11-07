const express = require("express");
const router = express.Router();
const webinarController = require("../controllers/webinarController");
const upload = require("../utils/multer");

router.post(
  "/",
  upload.single("speakerPhoto"),
  webinarController.createWebinar
);

router.get("/", webinarController.getAllWebinars);

router.get("/:id", webinarController.getWebinarById);

router.put(
  "/:id",
  upload.single("speakerPhoto"),
  webinarController.updateWebinar
);

router.delete("/:id", webinarController.deleteWebinar);

module.exports = router;
