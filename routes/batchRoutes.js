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
} = require("../controllers/batchController");

const batchRouter = express.Router();

batchRouter.route("/").get(getAllBatches).post(createBatch);
batchRouter.get("/all-batches-student", getBatchesByCourseAndStudent);
batchRouter.get("/all", getAllBatches1);
batchRouter.post("/student-batche", assignStudentToBatch);
batchRouter.get("/student/:studentId", getBatchesForStudent);
batchRouter.get("/:courseId", getBatchesByCourseId);
batchRouter.get("/trainer/:trainerId", getBatchesByTrainerId);
batchRouter.get("/:id", getBatchById);

batchRouter
  .route("/:id")

  .put(updateBatch)
  .delete(deleteBatch);
module.exports = batchRouter;
