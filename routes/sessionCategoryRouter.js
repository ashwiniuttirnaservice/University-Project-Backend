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
  checkAccess("sessionCategory", "create"),
  createSessionCategory
);

sessionCategoryRouter.get(
  "/",
  protect,
  checkAccess("sessionCategory", "read"),
  getAllSessionCategories
);

sessionCategoryRouter.get(
  "/:id",
  protect,
  checkAccess("sessionCategory", "read"),
  getSessionCategoryById
);

sessionCategoryRouter.put(
  "/:id",
  protect,
  checkAccess("sessionCategory", "update"),
  updateSessionCategory
);

sessionCategoryRouter.delete(
  "/:id",
  protect,
  checkAccess("sessionCategory", "delete"),
  deleteSessionCategory
);

module.exports = sessionCategoryRouter;
