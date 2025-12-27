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
  upload.single("CompanyLogo"),
  createContactInfo
);
contactInfoRouter.get(
  "/",

  getAllContactInfo
);
contactInfoRouter.get(
  "/:id",

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
