const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");

router.post("/mark/:meetingId", attendanceController.markAttendance);
router.get("/all", attendanceController.getAllAttendance);
router.get("/meeting/:meetingId", attendanceController.getAttendanceByMeeting);
router.get("/batch/:batchId", attendanceController.getAttendanceByBatch);
router.get("/student/:studentId", attendanceController.getAttendanceByStudent);
router.get("/stats", attendanceController.getAttendanceStats);
router.delete("/:id", attendanceController.deleteAttendance);

module.exports = router;
