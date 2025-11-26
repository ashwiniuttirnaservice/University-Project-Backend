const express = require("express");
const chapterRouter = express.Router();

const chapterController = require("../controllers/chapterController");
const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");

chapterRouter.post(
  "/",
  protect,
  checkAccess("chapter", "create"),
  chapterController.createChapter
);

chapterRouter.get(
  "/course/:courseId",
  protect,
  checkAccess("chapter", "read"),
  chapterController.getChaptersByCourse
);

chapterRouter.get(
  "/",
  protect,
  checkAccess("chapter", "read"),
  chapterController.getAllChapters
);

chapterRouter.get(
  "/all",
  protect,
  checkAccess("chapter", "read"),
  chapterController.getAllChapters1
);

chapterRouter.get(
  "/:id",
  protect,
  checkAccess("chapter", "read"),
  chapterController.getChapterById
);

chapterRouter.put(
  "/:id",
  protect,
  checkAccess("chapter", "update"),
  chapterController.updateChapter
);

chapterRouter.delete(
  "/:id",
  protect,
  checkAccess("chapter", "delete"),
  chapterController.deleteChapter
);

module.exports = chapterRouter;
