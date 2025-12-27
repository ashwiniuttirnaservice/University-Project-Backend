const express = require("express");
const hackathonRouter = express.Router();

const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");

const hackathonController = require("../controllers/hackathonController");

hackathonRouter.post(
  "/",
  protect,
  checkAccess("hackathon", "create"),
  hackathonController.createHackathon
);

hackathonRouter.get(
  "/",
  protect,
  checkAccess("hackathon", "read"),
  hackathonController.getAllHackathons
);

hackathonRouter.get(
  "/:id",
  protect,
  checkAccess("hackathon", "read"),
  hackathonController.getHackathonById
);

hackathonRouter.put(
  "/:id",
  protect,
  checkAccess("hackathon", "update"),
  hackathonController.updateHackathon
);

hackathonRouter.delete(
  "/:id",
  protect,
  checkAccess("hackathon", "delete"),
  hackathonController.deleteHackathon
);

module.exports = hackathonRouter;
