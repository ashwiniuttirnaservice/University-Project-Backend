const express = require("express");
const chapterRouter = express.Router();

const chapterController = require("../controllers/chapterController");
const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");

chapterRouter.post(
  "/",
  protect,
  checkAccess("Curriculum", "create"),
  chapterController.createChapter
);

chapterRouter.get(
  "/course/:courseId",
  protect,
  checkAccess("Curriculum", "read"),
  chapterController.getChaptersByCourse
);

chapterRouter.get(
  "/",
  protect,
  checkAccess("Curriculum", "read"),
  chapterController.getAllChapters
);

chapterRouter.get(
  "/all",
  protect,
  checkAccess("Curriculum", "read"),
  chapterController.getAllChapters1
);

chapterRouter.get(
  "/:id",
  protect,
  checkAccess("Curriculum", "read"),
  chapterController.getChapterById
);

chapterRouter.put(
  "/:id",
  protect,
  checkAccess("Curriculum", "update"),
  chapterController.updateChapter
);

chapterRouter.delete(
  "/:id",
  protect,
  checkAccess("Curriculum", "delete"),
  chapterController.deleteChapter
);

module.exports = chapterRouter;
