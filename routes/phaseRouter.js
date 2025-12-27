const express = require("express");
const phaseRouter = express.Router();

const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");

const phaseController = require("../controllers/phaseController");

phaseRouter.post(
  "/",
  protect,
  checkAccess("Curriculum", "create"),
  phaseController.createPhase
);

phaseRouter.get(
  "/",
  protect,
  checkAccess("Curriculum", "read"),
  phaseController.getAllPhases
);

phaseRouter.get(
  "/course/:courseId",
  protect,
  checkAccess("Curriculum", "read"),
  phaseController.getPhasesByCourseId
);

phaseRouter.get(
  "/:id",
  protect,
  checkAccess("Curriculum", "read"),
  phaseController.getPhaseById
);

phaseRouter.put(
  "/:id",
  protect,
  checkAccess("Curriculum", "update"),
  phaseController.updatePhase
);

phaseRouter.delete(
  "/:id",
  protect,
  checkAccess("Curriculum", "delete"),
  phaseController.deletePhase
);

module.exports = phaseRouter;
