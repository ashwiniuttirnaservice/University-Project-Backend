const express = require("express");
const {
  createWorkshop,
  getAllWorkshops,
  getWorkshopById,
  updateWorkshop,
  deleteWorkshop,
} = require("../controllers/workshopController");

const router = express.Router();

router.get("/", getAllWorkshops);
router.get("/:id", getWorkshopById);

router.post("/", createWorkshop);
router.put("/:id", updateWorkshop);
router.delete("/:id", deleteWorkshop);

module.exports = router;
