const express = require("express");
const testRouter = express.Router();

const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");
const roleFilter = require("../middleware/roleFilter");
const {
  uploadMiddleware,
  uploadExcel,
  createTest,
  getQuestionsForAdmin,
  getTestById,
  deleteTestById,
  getTestListForAdmin,
  getAllTests,
  getTestsByBatchId,
} = require("../controllers/TestController");

testRouter.post(
  "/upload-excel",
  protect,
  checkAccess("test", "create"),
  uploadMiddleware,
  uploadExcel
);

testRouter.post("/create", createTest);
// protect, checkAccess("test", "create"),
testRouter.get(
  "/",
  protect,
  roleFilter,
  checkAccess("test", "read"),
  getAllTests
);

testRouter.get("/:id", getTestById);

testRouter.get(
  "/questions/:id",
  protect,
  checkAccess("test", "read"),
  getQuestionsForAdmin
);

testRouter.get(
  "/batch/:batchId",
  // protect,
  // checkAccess("test", "read"),
  getTestsByBatchId
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
