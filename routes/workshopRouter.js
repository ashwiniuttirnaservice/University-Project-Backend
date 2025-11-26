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
  checkAccess("workshop", "read"),
  getAllWorkshops
);

workshopRouter.get(
  "/:id",
  protect,
  checkAccess("workshop", "read"),
  getWorkshopById
);

workshopRouter.post(
  "/",
  protect,
  checkAccess("workshop", "create"),
  createWorkshop
);

workshopRouter.put(
  "/:id",
  protect,
  checkAccess("workshop", "update"),
  updateWorkshop
);

workshopRouter.delete(
  "/:id",
  protect,
  checkAccess("workshop", "delete"),
  deleteWorkshop
);

module.exports = workshopRouter;
