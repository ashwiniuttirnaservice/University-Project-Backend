const express = require("express");
const meetingRouter = express.Router();

const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");
const meetingController = require("../controllers/meetingController");

const roleFilter = require("../middleware/roleFilter");

meetingRouter.post(
  "/",
  protect,
  checkAccess("meeting", "create"),
  meetingController.createMeeting
);
meetingRouter.get(
  "/",
  protect,
  roleFilter,
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
