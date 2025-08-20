const express = require("express");
const {
  createWorkshop,
  getAllWorkshops,
  getWorkshopById,
  updateWorkshop,
  deleteWorkshop,
} = require("../controllers/workshopController");

const router = express.Router();

// Public Routes
router.get("/", getAllWorkshops);
router.get("/:id", getWorkshopById);

// Admin/Trainer Protected Routes (add auth middleware if needed)
router.post("/", createWorkshop);
router.put("/:id", updateWorkshop);
router.delete("/:id", deleteWorkshop);

module.exports = router;
