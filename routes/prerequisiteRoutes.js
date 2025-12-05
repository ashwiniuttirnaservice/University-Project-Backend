const express = require("express");
const router = express.Router();

const upload = require("../utils/multer");
const prerequisiteController = require("../controllers/prerequisiteController");
const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");
const roleFilter = require("../middleware/roleFilter");
router.post(
  "/",
  upload.fields([{ name: "materialFiles", maxCount: 10 }]),

  prerequisiteController.createPrerequisite
);

router.get(
  "/",
  protect,
  roleFilter,
  checkAccess("prerequisite", "read"),
  prerequisiteController.getAllPrerequisites
);
router.get(
  "/:id",
  protect,

  checkAccess("prerequisite", "read"),
  prerequisiteController.getPrerequisiteById
);

router.put(
  "/:id",
  upload.fields([{ name: "materialFiles", maxCount: 10 }]),
  protect,
  checkAccess("prerequisite", "update"),
  prerequisiteController.updatePrerequisite
);

router.delete(
  "/:id",
  protect,
  checkAccess("prerequisite", "delete"),
  prerequisiteController.softDeletePrerequisite
);

module.exports = router;
