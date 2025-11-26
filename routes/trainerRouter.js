const express = require("express");
const trainerRouter = express.Router();

const upload = require("../utils/multer");
const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");

const {
  registerTrainer,
  getAllTrainers,
  getApprovedTrainers,
  getAllTrainer,
  updateTrainerApproval,
  updateTrainer,
  deleteTrainer,
  getTrainerSummary,
  getTrainerById,
} = require("../controllers/trainerController");

trainerRouter.post(
  "/register",
  protect,
  checkAccess("trainer", "create"),
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "idProofTrainer", maxCount: 1 },
    { name: "profilePhotoTrainer", maxCount: 1 },
  ]),
  registerTrainer
);

trainerRouter.get(
  "/approved",
  protect,
  checkAccess("trainer", "read"),
  getApprovedTrainers
);

trainerRouter.get(
  "/all",
  protect,
  checkAccess("trainer", "read"),
  getAllTrainers
);

trainerRouter.get(
  "/all-profile",
  protect,
  checkAccess("trainer", "read"),
  getAllTrainer
);

trainerRouter.put(
  "/approve/:trainerId",
  protect,
  checkAccess("trainer", "update"),
  updateTrainerApproval
);

trainerRouter.put(
  "/update/:trainerId",
  protect,
  checkAccess("trainer", "update"),
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "idProofTrainer", maxCount: 1 },
    { name: "profilePhotoTrainer", maxCount: 1 },
  ]),
  updateTrainer
);

trainerRouter.get(
  "/summary",
  protect,
  checkAccess("trainer", "read"),
  getTrainerSummary
);

trainerRouter.get(
  "/:trainerId",
  protect,
  checkAccess("trainer", "read"),
  getTrainerById
);

trainerRouter.delete(
  "/delete/:trainerId",
  protect,
  checkAccess("trainer", "delete"),
  deleteTrainer
);

module.exports = trainerRouter;
