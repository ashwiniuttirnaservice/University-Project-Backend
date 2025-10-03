const express = require("express");
const router = express.Router();
const weekController = require("../controllers/weekController");

router.post("/", weekController.createWeek);
router.get("/", weekController.getAllWeeks);
router.get("/:id", weekController.getWeekById);
router.put("/:id", weekController.updateWeek);
router.delete("/:id", weekController.deleteWeek);

module.exports = router;
