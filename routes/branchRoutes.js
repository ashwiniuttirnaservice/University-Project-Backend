const express = require("express");
const {
  getAllBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
} = require("../controllers/branchController.js");
const { protect, authorize } = require("../middleware/authMiddleware.js");

const brachRouter = express.Router();

brachRouter
  .route("/")
  .get(getAllBranches) // Public
  .post(protect, authorize("admin"), createBranch); // Admin only

brachRouter
  .route("/:id")
  .get(getBranchById) // Public
  .put(protect, authorize("admin"), updateBranch) // Admin only
  .delete(protect, authorize("admin"), deleteBranch); // Admin only

module.exports = brachRouter;
