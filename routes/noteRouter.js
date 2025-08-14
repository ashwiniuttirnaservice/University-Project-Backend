const express = require("express");
const {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,
} = require("../controllers/noteController");
const upload = require("../utils/multer"); // multer config with getFolderPath

const router = express.Router();

// Upload middleware for notes
router.post(
  "/",
  upload.fields([{ name: "file", maxCount: 1 }]), // PDF/Doc file
  createNote
);

router.get("/", getAllNotes);
router.get("/:id", getNoteById);

router.put(
  "/:id",
  upload.fields([{ name: "file", maxCount: 1 }]), // optional file update
  updateNote
);

router.delete("/:id", deleteNote);

module.exports = router;
