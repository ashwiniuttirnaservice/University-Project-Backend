const express = require("express");
const router = express.Router();
const meetingController = require("../controllers/meetingController");

router.post(
  "/",

  meetingController.createMeeting
);

router.get("/", meetingController.getAllMeetings);

router.get("/:id", meetingController.getMeetingById);

router.get("/batch/:batchId", meetingController.getMeetingsByBatch);
router.put(
  "/:id",

  meetingController.updateMeeting
);

router.delete(
  "/:id",

  meetingController.deleteMeeting
);

module.exports = router;
