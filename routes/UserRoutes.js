const express = require("express");
const userRouter = express.Router();
const {
  getUserProfile,
  getUserProfileTrainer,
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
} = require("../controllers/UserController.js");

const { protect, admin } = require("../middleware/authMiddleware.js");
const validateRequest = require("../validations/validateMiddleware.js");
const userValidationSchema = require("../validations/userValidation");

userRouter.route("/profile").get(protect, getUserProfile);
userRouter.route("/profiles").get(protect, getUserProfileTrainer);

userRouter.route("/").post(protect, admin, getUsers);

userRouter
  .route("/:id")
  .get(protect, admin, getUserById)
  .delete(protect, admin, deleteUser)
  .put(protect, admin, validateRequest(userValidationSchema), updateUser);

module.exports = userRouter;
