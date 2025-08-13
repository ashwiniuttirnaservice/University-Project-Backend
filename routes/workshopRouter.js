const express = require("express");
const router = express.Router();
const {
  registerWorkshop,
  getAllWorkshops,
  getWorkshopById,
} = require("../controllers/workshopController");

router.post("/register", registerWorkshop);
router.get("/", getAllWorkshops);
router.get("/:id", getWorkshopById);

module.exports = router;
