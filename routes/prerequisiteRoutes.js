const express = require("express");
const router = express.Router();

const upload = require("../utils/multer");
const prerequisiteController = require("../controllers/prerequisiteController");

router.post(
  "/",
  upload.fields([{ name: "materialFiles", maxCount: 10 }]),
  prerequisiteController.createPrerequisite
);

router.get("/", prerequisiteController.getAllPrerequisites);
router.get("/:id", prerequisiteController.getPrerequisiteById);

router.put(
  "/:id",
  upload.fields([{ name: "materialFiles", maxCount: 10 }]),
  prerequisiteController.updatePrerequisite
);

router.delete("/:id", prerequisiteController.softDeletePrerequisite);

module.exports = router;
