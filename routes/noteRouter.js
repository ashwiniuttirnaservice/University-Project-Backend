const express = require("express");
const noteRouter = express.Router();

const upload = require("../utils/multer");

const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");

const {
  createNote,
  getAllNotes,
  getNoteById,
  getNotesByCourse,
  updateNote,
  deleteNote,
} = require("../controllers/noteController");

noteRouter.post(
  "/",
  // protect,
  // checkAccess("note", "create"),
  upload.single("file"),
  createNote
);

noteRouter.get("/", protect, checkAccess("note", "read"), getAllNotes);

noteRouter.get("/:id", protect, checkAccess("note", "read"), getNoteById);

noteRouter.get(
  "/course/:courseId",
  protect,
  checkAccess("note", "read"),
  getNotesByCourse
);

noteRouter.put(
  "/:id",
  protect,
  checkAccess("note", "update"),
  upload.single("file"),
  updateNote
);

noteRouter.delete("/:id", protect, checkAccess("note", "delete"), deleteNote);

module.exports = noteRouter;
