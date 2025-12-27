const express = require("express");
const noteRouter = express.Router();

const upload = require("../utils/multer");

const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");

const {
  createNote,
  cloneNote,
  getAllNotes,
  getNoteById,
  getNotesByCourse,
  updateNote,
  deleteNote,
} = require("../controllers/noteController");
const roleFilter = require("../middleware/roleFilter");
noteRouter.post(
  "/",
  // protect,
  // checkAccess("note", "create"),
  upload.single("file"),
  createNote
);

noteRouter.post(
  "/:noteId/clone",

  upload.single("file"),
  cloneNote
);

noteRouter.get(
  "/",
  protect,
  roleFilter,
  checkAccess("note", "read"),
  getAllNotes
);

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
