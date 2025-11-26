const express = require("express");
const weekRouter = express.Router();

const weekController = require("../controllers/weekController");
const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");

weekRouter.post(
  "/",
  protect,
  checkAccess("week", "create"),
  weekController.createWeek
);

weekRouter.get(
  "/",
  protect,
  checkAccess("week", "read"),
  weekController.getAllWeeks
);

weekRouter.get(
  "/course/:courseId",
  protect,
  checkAccess("week", "read"),
  weekController.getWeeksByCourseId
);

weekRouter.get(
  "/:id",
  protect,
  checkAccess("week", "read"),
  weekController.getWeekById
);

weekRouter.put(
  "/:id",
  protect,
  checkAccess("week", "update"),
  weekController.updateWeek
);

weekRouter.delete(
  "/:id",
  protect,
  checkAccess("week", "delete"),
  weekController.deleteWeek
);

module.exports = weekRouter;
