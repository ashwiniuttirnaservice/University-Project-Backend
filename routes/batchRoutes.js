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
batchRouter.get("/:courseId", getBatchesByCourseId);

batchRouter
  .route("/:id")
  .get(getBatchById)
  .put(updateBatch)
  .delete(deleteBatch);
module.exports = batchRouter;
