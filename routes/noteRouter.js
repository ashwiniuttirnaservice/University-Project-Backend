const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");
const {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,
} = require("../controllers/noteController");

// Create Note (with file upload)
router.post("/", upload.single("file"), createNote);

// Get All Notes
router.get("/", getAllNotes);

// Get Note by ID
router.get("/:id", getNoteById);

// Update Note
router.put("/:id", upload.single("file"), updateNote);

// Delete Note
router.delete("/:id", deleteNote);

module.exports = router;
