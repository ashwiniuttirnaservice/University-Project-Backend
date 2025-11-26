const express = require("express");
const workshopRouter = express.Router();

const {
  createWorkshop,
  getAllWorkshops,
  getWorkshopById,
  updateWorkshop,
  deleteWorkshop,
} = require("../controllers/workshopController");

const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");

workshopRouter.get(
  "/",
  protect,
  checkAccess("session", "read"),
  getAllWorkshops
);

workshopRouter.get(
  "/:id",
  protect,
  checkAccess("session", "read"),
  getWorkshopById
);

workshopRouter.post(
  "/",
  protect,
  checkAccess("session", "create"),
  createWorkshop
);

workshopRouter.put(
  "/:id",
  protect,
  checkAccess("session", "update"),
  updateWorkshop
);

workshopRouter.delete(
  "/:id",
  protect,
  checkAccess("session", "delete"),
  deleteWorkshop
);

module.exports = workshopRouter;
