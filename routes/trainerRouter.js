const express = require("express");
const {
  registerTrainer,
  getAllTrainers,
  getAllTrainer,
  updateTrainerApproval,
  updateTrainer,
  deleteTrainer,
  getTrainerSummary,
} = require("../controllers/trainerController");
const upload = require("../utils/multer");

const trainerRouter = express.Router();

trainerRouter.post(
  "/register",
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "idProofTrainer", maxCount: 1 },
    { name: "profilePhotoTrainer", maxCount: 1 },
  ]),
  registerTrainer
);

trainerRouter.get("/all", getAllTrainers);
trainerRouter.get("/all-profile", getAllTrainer);
trainerRouter.put("/approve/:trainerId", updateTrainerApproval);

trainerRouter.put(
  "/update/:trainerId",
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "idProofTrainer", maxCount: 1 },
    { name: "profilePhotoTrainer", maxCount: 1 },
  ]),
  updateTrainer
);

trainerRouter.get("/summary", getTrainerSummary);

trainerRouter.delete("/delete/:trainerId", deleteTrainer);

module.exports = trainerRouter;
