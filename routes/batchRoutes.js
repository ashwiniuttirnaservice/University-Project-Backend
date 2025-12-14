const express = require("express");
const {
  createBatch,
  getAllBatches,
  getBatchesByCourseAndStudent,
  getBatchById,
  getBatchesByCourseId,
  getBatchesByTrainerId,
  updateBatch,
  deleteBatch,
  assignStudentToBatch,
  getAllBatches1,
  getBatchesForStudent,
  uploadEnrollmentExcel,
} = require("../controllers/batchController");

const upload = require("../utils/multer");
const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");
const roleFilter = require("../middleware/roleFilter");

const router = express.Router();

router.post("/", protect, checkAccess("batch", "create"), createBatch);

router.post("/student-batche", assignStudentToBatch);

router.post("/upload-excel", upload.single("excelFile"), uploadEnrollmentExcel);

router.get("/", protect, checkAccess("batch", "read"), getAllBatches);

router.get(
  "/all",
  protect,
  roleFilter,
  checkAccess("batch", "read"),
  getAllBatches1
);

router.get(
  "/student/:studentId",
  protect,

  checkAccess("batch", "read"),
  getBatchesForStudent
);

router.get(
  "/all-batches-student",
  protect,

  checkAccess("batch", "read"),
  getBatchesByCourseAndStudent
);

router.get(
  "/trainer/:trainerId",

  getBatchesByTrainerId
);

router.get(
  "/course/:courseId",

  getBatchesByCourseId
);

router.get("/batches/:id", protect, getBatchById);

router.put("/:id", protect, checkAccess("batch", "update"), updateBatch);

router.delete("/:id", protect, checkAccess("batch", "delete"), deleteBatch);

module.exports = router;
