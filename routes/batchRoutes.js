const express = require("express");
const {
  createBatch,
  getAllBatches,
  getBatchesByCourseAndStudent,
  getBatchById,
  updateBatch,
  deleteBatch,
  assignStudentToBatch,
  getBatchesForStudent,
} = require("../controllers/batchController");
const { protect, authorize } = require("../middleware/authMiddleware");

const batchRouter = express.Router();

batchRouter
  .route("/")
  .get(protect, authorize("admin", "trainer"), getAllBatches)
  .post(protect, authorize("admin", "trainer"), createBatch);

batchRouter.get("/all-batches-student", getBatchesByCourseAndStudent);
batchRouter.get("/student-batche", assignStudentToBatch);
batchRouter.get("/student/:studentId", getBatchesForStudent);

batchRouter
  .route("/:id")
  .get(protect, authorize("admin", "trainer"), getBatchById)
  .put(protect, authorize("admin", "trainer"), updateBatch)
  .delete(protect, authorize("admin"), deleteBatch); // Only admin can delete

module.exports = batchRouter;
