const express = require("express");
const router = express.Router();
const {
  createContactInfo,
  getAllContactInfo,
  getContactInfoById,
  updateContactInfo,
  deleteContactInfo,
} = require("../controllers/contactInfoController");
const upload = require("../utils/multer");

router.post("/", upload.single("logo"), createContactInfo);

router.get("/", getAllContactInfo);

router.get("/:id", getContactInfoById);

router.put("/:id", upload.single("logo"), updateContactInfo);

router.delete("/:id", deleteContactInfo);

module.exports = router;
