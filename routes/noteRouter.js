const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");
const {
  createNote,
  getAllNotes,
  getNoteById,
  getNotesByCourse,
  updateNote,
  deleteNote,
} = require("../controllers/noteController");

router.post("/", upload.single("file"), createNote);

router.get("/", getAllNotes);

router.get("/:id", getNoteById);

router.put("/:id", upload.single("file"), updateNote);

router.delete("/:id", deleteNote);

router.get("/course/:courseId", getNotesByCourse);

module.exports = router;
