import express from "express";
import {
  registerTrainer,
  getAllTrainers,
  updateTrainerApproval,
  updateTrainer,
  deleteTrainer,
} from "../controllers/trainerController.js";
import upload from "../utils/multer.js";

const trainerRouter = express.Router();

trainerRouter.post(
  "/register",
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "idProof", maxCount: 1 },
    { name: "profilePhoto", maxCount: 1 },
  ]),
  registerTrainer
);

trainerRouter.get("/all", getAllTrainers);

trainerRouter.put("/approve/:trainerId", updateTrainerApproval);

trainerRouter.put(
  "/update/:trainerId",
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "idProof", maxCount: 1 },
    { name: "profilePhoto", maxCount: 1 },
  ]),
  updateTrainer
);

trainerRouter.delete("/delete/:trainerId", deleteTrainer);

export default trainerRouter;
