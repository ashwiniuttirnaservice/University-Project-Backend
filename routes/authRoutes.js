const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  resetPassword,
  logout,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
router.put(
  "/reset-password",

  resetPassword
);

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logout);

router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

module.exports = router;
