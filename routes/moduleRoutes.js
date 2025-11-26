const express = require("express");
const router = express.Router();

const {
  createModules,
  getAllModules,
  getModuleById,
  updateModule,
  deleteModule,
} = require("../controllers/moduleController");

router.post("/", createModules);

router.get("/", getAllModules);
router.get("/:id", getModuleById);

router.put("/:id", updateModule);

router.delete("/:id", deleteModule);

module.exports = router;
