const express = require("express");
const {
  createBatch,
  getAllBatches,
  getBatchesByCourseAndStudent,
  getBatchById,
  getBatchesByCourseId,
  updateBatch,
  deleteBatch,
  assignStudentToBatch,
  getBatchesForStudent,
} = require("../controllers/batchController");

const batchRouter = express.Router();

batchRouter.route("/").get(getAllBatches).post(createBatch);
batchRouter.get("/all-batches-student", getBatchesByCourseAndStudent);
batchRouter.post("/student-batche", assignStudentToBatch);
batchRouter.get("/student/:studentId", getBatchesForStudent);
batchRouter.get("/course/:courseId", getBatchesByCourseId);
batchRouter.get("/:id", getBatchById);

batchRouter
  .route("/:id")

  .put(updateBatch)
  .delete(deleteBatch);
module.exports = batchRouter;
