const express = require("express");
const userRouter = express.Router();
const {
  // Naya controller function import kiya hai
  getUserProfile,
  getUserProfileTrainer,
  getUsers,
  getUserById,
  deleteUser,

  updateUser,
} = require("../controllers/UserController.js");
const { protect, admin } = require("../middleware/authMiddleware.js");

// --- Student Route ---
// Yeh naya route hai. Koi bhi logged-in user (student ya admin)
// apni profile details yahan se fetch kar sakta hai.
// Ismein sirf 'protect' middleware laga hai, 'admin' nahi.
userRouter.route("/profile").get(protect, getUserProfile);
userRouter.route("/profiles").get(protect, getUserProfileTrainer);
// --- Admin Routes ---
// Yeh routes sirf admin ke liye hain.
// In par 'protect' aur 'admin' dono middleware lage hain.
userRouter.route("/").get(protect, admin, getUsers);
userRouter
  .route("/:id")
  .get(protect, admin, getUserById)
  .delete(protect, admin, deleteUser)
  .put(protect, admin, updateUser);

module.exports = userRouter;
