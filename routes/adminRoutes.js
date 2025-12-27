const express = require("express");
const {
  getAllUsers,
  getUserById,
  updateUserByAdmin,
  deleteUserByAdmin,
} = require("../controllers/adminController.js");
const { protect, authorize } = require("../middleware/authMiddleware.js");

const adminRouter = express.Router();

adminRouter.route("/users").get(getAllUsers);
adminRouter
  .route("/users/:id")
  .get(getUserById)
  .put(updateUserByAdmin)
  .delete(deleteUserByAdmin);

module.exports = adminRouter;
