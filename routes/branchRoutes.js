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
  .get(getAllBranches)
  .post(protect, authorize("admin"), createBranch);
brachRouter
  .route("/:id")
  .get(getBranchById)
  .put(protect, authorize("admin"), updateBranch)
  .delete(protect, authorize("admin"), deleteBranch);

module.exports = brachRouter;
