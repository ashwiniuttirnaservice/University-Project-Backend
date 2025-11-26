const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");

router.post(
  "/mark/:meetingId",
  protect,
  checkAccess("attendance", "create"),
  attendanceController.markAttendance
);

// READ
router.get(
  "/all",
  protect,
  checkAccess("attendance", "read"),
  attendanceController.getAllAttendance
);

router.get(
  "/all-data",
  protect,
  checkAccess("attendance", "read"),
  attendanceController.getAllAttendance1
);

router.get(
  "/meeting/:meetingId",
  protect,
  checkAccess("attendance", "read"),
  attendanceController.getAttendanceByMeeting
);

router.get(
  "/batch/:batchId",
  protect,
  checkAccess("attendance", "read"),
  attendanceController.getAttendanceByBatch
);

router.get(
  "/student/:studentId",
  protect,
  checkAccess("attendance", "read"),
  attendanceController.getAttendanceByStudent
);

router.get(
  "/stats",
  protect,
  checkAccess("attendance", "read"),
  attendanceController.getAttendanceStats
);

router.delete(
  "/:id",
  protect,
  checkAccess("attendance", "delete"),
  attendanceController.deleteAttendance
);

router.get(
  "/download",
  protect,
  checkAccess("attendance", "read"),
  attendanceController.downloadAttendanceExcel
);

module.exports = router;
