const express = require("express");
const meetingRouter = express.Router();

const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");

const meetingController = require("../controllers/meetingController");

meetingRouter.post(
  "/",
  protect,
  checkAccess("meeting", "create"),
  meetingController.createMeeting
);
meetingRouter.get(
  "/",
  protect,
  checkAccess("meeting", "read"),
  meetingController.getAllMeetings
);

meetingRouter.get(
  "/:id",
  protect,
  checkAccess("meeting", "read"),
  meetingController.getMeetingById
);

meetingRouter.get(
  "/batch/:batchId",
  protect,
  checkAccess("meeting", "read"),
  meetingController.getMeetingsByBatch
);

meetingRouter.put(
  "/:id",
  protect,
  checkAccess("meeting", "update"),
  meetingController.updateMeeting
);

meetingRouter.delete(
  "/:id",
  protect,
  checkAccess("meeting", "delete"),
  meetingController.deleteMeeting
);

module.exports = meetingRouter;
