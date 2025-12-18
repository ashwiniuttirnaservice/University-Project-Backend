const express = require("express");
const router = express.Router();
const {
  createOrGetProgress,
  completeTopic,
  getStudentProgress,
} = require("../controllers/prerequisiteProgressController");

router.post("/", createOrGetProgress);
router.post("/complete-topic", completeTopic);
router.get("/", getStudentProgress);

module.exports = router;
