const express = require("express");
const {
  getAllUsers,
  getUserById,
  updateUserByAdmin,
  deleteUserByAdmin,
} = require("../controllers/adminController.js");
const { protect, authorize } = require("../middleware/authMiddleware.js");

const adminRouter = express.Router();

// All routes in this file are protected and require admin role
adminRouter.use(protect);
adminRouter.use(authorize("admin"));

adminRouter.route("/users").get(getAllUsers);
adminRouter
  .route("/users/:id")
  .get(getUserById)
  .put(updateUserByAdmin)
  .delete(deleteUserByAdmin);

// Add other admin-specific routes here, e.g., for platform statistics, content management etc.

module.exports = adminRouter;
