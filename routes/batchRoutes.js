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
  roleFilter,
  checkAccess("batch", "read"),
  getBatchesForStudent
);

router.get(
  "/all-batches-student",
  protect,
  roleFilter,
  checkAccess("batch", "read"),
  getBatchesByCourseAndStudent
);

router.get(
  "/trainer/:trainerId",
  protect,

  checkAccess("batch", "read"),
  getBatchesByTrainerId
);

router.get(
  "/course/:courseId",
  protect,

  checkAccess("batch", "read"),
  getBatchesByCourseId
);

router.get(
  "/batches/:id",
  protect,

  checkAccess("batch", "read"),
  getBatchById
);

router.put("/:id", protect, checkAccess("batch", "update"), updateBatch);

router.delete("/:id", protect, checkAccess("batch", "delete"), deleteBatch);

module.exports = router;
