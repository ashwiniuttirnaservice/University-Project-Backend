const express = require("express");
const weekRouter = express.Router();

const weekController = require("../controllers/weekController");
const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");

weekRouter.post(
  "/",
  protect,
  checkAccess("Curriculum", "create"),
  weekController.createWeek
);

weekRouter.get(
  "/",
  protect,
  checkAccess("Curriculum", "read"),
  weekController.getAllWeeks
);

weekRouter.get(
  "/course/:courseId",
  protect,
  checkAccess("Curriculum", "read"),
  weekController.getWeeksByCourseId
);

weekRouter.get(
  "/:id",
  protect,
  checkAccess("Curriculum", "read"),
  weekController.getWeekById
);

weekRouter.put(
  "/:id",
  protect,
  checkAccess("Curriculum", "update"),
  weekController.updateWeek
);

weekRouter.delete(
  "/:id",
  protect,
  checkAccess("Curriculum", "delete"),
  weekController.deleteWeek
);

module.exports = weekRouter;
