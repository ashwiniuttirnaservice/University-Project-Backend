const express = require("express");
const sessionCategoryRouter = express.Router();

const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");

const {
  createSessionCategory,
  getAllSessionCategories,
  getSessionCategoryById,
  updateSessionCategory,
  deleteSessionCategory,
} = require("../controllers/sessionCategoryController");

sessionCategoryRouter.post(
  "/",
  protect,
  checkAccess("session", "create"),
  createSessionCategory
);

sessionCategoryRouter.get(
  "/",
  protect,
  checkAccess("session", "read"),
  getAllSessionCategories
);

sessionCategoryRouter.get(
  "/:id",
  protect,
  checkAccess("session", "read"),
  getSessionCategoryById
);

sessionCategoryRouter.put(
  "/:id",
  protect,
  checkAccess("session", "update"),
  updateSessionCategory
);

sessionCategoryRouter.delete(
  "/:id",
  protect,
  checkAccess("session", "delete"),
  deleteSessionCategory
);

module.exports = sessionCategoryRouter;
