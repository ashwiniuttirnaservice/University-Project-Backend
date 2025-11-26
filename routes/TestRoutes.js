const express = require("express");
const testRouter = express.Router();

const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");

const {
  uploadMiddleware,
  uploadExcel,
  createTest,
  getQuestionsForAdmin,
  deleteTestById,
  getTestListForAdmin,
  getAllTests,
} = require("../controllers/TestController");

testRouter.post(
  "/upload-excel",
  protect,
  checkAccess("test", "create"),
  uploadMiddleware,
  uploadExcel
);

testRouter.post("/create", protect, checkAccess("test", "create"), createTest);

testRouter.get("/", protect, checkAccess("test", "read"), getAllTests);

testRouter.get(
  "/questions/:id",
  protect,
  checkAccess("test", "read"),
  getQuestionsForAdmin
);

testRouter.post(
  "/list",
  protect,
  checkAccess("test", "read"),
  getTestListForAdmin
);

testRouter.delete(
  "/:id",
  protect,
  checkAccess("test", "delete"),
  deleteTestById
);

module.exports = testRouter;
