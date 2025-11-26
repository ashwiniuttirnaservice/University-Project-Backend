const express = require("express");
const contactInfoRouter = express.Router();

const {
  createContactInfo,
  getAllContactInfo,
  getContactInfoById,
  updateContactInfo,
  deleteContactInfo,
} = require("../controllers/contactInfoController");

const upload = require("../utils/multer");
const { protect } = require("../middleware/authMiddleware");
const checkAccess = require("../middleware/checkAccess");

contactInfoRouter.post(
  "/",
  protect,
  checkAccess("contactInfo", "create"),
  upload.single("logo"),
  createContactInfo
);
contactInfoRouter.get(
  "/",
  protect,
  checkAccess("contactInfo", "read"),
  getAllContactInfo
);
contactInfoRouter.get(
  "/:id",
  protect,
  checkAccess("contactInfo", "read"),
  getContactInfoById
);

contactInfoRouter.put(
  "/:id",
  protect,
  checkAccess("contactInfo", "update"),
  upload.single("logo"),
  updateContactInfo
);

contactInfoRouter.delete(
  "/:id",
  protect,
  checkAccess("contactInfo", "delete"),
  deleteContactInfo
);

module.exports = contactInfoRouter;
