const express = require("express");
const phaseRouter = express.Router();

const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");

const phaseController = require("../controllers/phaseController");

phaseRouter.post(
  "/",
  protect,
  checkAccess("phase", "create"),
  phaseController.createPhase
);

phaseRouter.get(
  "/",
  protect,
  checkAccess("phase", "read"),
  phaseController.getAllPhases
);

phaseRouter.get(
  "/course/:courseId",
  protect,
  checkAccess("phase", "read"),
  phaseController.getPhasesByCourseId
);

phaseRouter.get(
  "/:id",
  protect,
  checkAccess("phase", "read"),
  phaseController.getPhaseById
);

phaseRouter.put(
  "/:id",
  protect,
  checkAccess("phase", "update"),
  phaseController.updatePhase
);

phaseRouter.delete(
  "/:id",
  protect,
  checkAccess("phase", "delete"),
  phaseController.deletePhase
);

module.exports = phaseRouter;
