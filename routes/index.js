import express from "express";
import trainerRouter from "./trainerRouter.js";
const indexRouter = express.Router();
indexRouter.use("/trainer", trainerRouter);
export default indexRouter;
