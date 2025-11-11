const express = require("express");
const {
  uploadMiddleware,
  uploadExcel,
  createTest,
  getQuestionsForAdmin,
  deleteTestById,
  getTestListForAdmin,
} = require("../controllers/TestController");
const router = express.Router();

router.post("/upload-excel", uploadMiddleware, uploadExcel);

router.post("/create", createTest);

router.get("/questions/:id", getQuestionsForAdmin);

router.delete("/:id", deleteTestById);

router.post("/list", getTestListForAdmin);

module.exports = router;
