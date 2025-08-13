const express = require("express");
const router = express.Router();
const {
  createSessionCategory,
  getAllSessionCategories,
  getSessionCategoryById,
  updateSessionCategory,
  deleteSessionCategory,
} = require("../controllers/sessionCategoryController");

// Routes
router.post("/", createSessionCategory);
router.get("/", getAllSessionCategories);
router.get("/:id", getSessionCategoryById);
router.put("/:id", updateSessionCategory);
router.delete("/:id", deleteSessionCategory);

module.exports = router;
