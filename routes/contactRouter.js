const express = require("express");
const {
  sendContactMessage,
  getAllContactMessages,
} = require("../controllers/contactController");

const router = express.Router();

router.post("/", sendContactMessage); // For frontend form
router.get("/", getAllContactMessages); // For admin dashboard

module.exports = router;
