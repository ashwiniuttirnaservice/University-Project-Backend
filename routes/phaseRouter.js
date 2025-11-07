const express = require("express");
const router = express.Router();
const phaseController = require("../controllers/phaseController");

router.post("/", phaseController.createPhase);
router.get("/", phaseController.getAllPhases);
router.get("/:courseId", phaseController.getPhasesByCourseId);
router.get("/p1/:id", phaseController.getPhaseById);
router.put("/:id", phaseController.updatePhase);
router.delete("/:id", phaseController.deletePhase);

module.exports = router;
