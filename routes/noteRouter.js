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

router.post("/", upload.single("file"), createNote);

router.get("/", getAllNotes);

router.get("/:id", getNoteById);

router.put("/:id", upload.single("file"), updateNote);

router.delete("/:id", deleteNote);

module.exports = router;
