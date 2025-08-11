const ContactMessage = require("../models/ContactMessage");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

// POST /api/contact - Save contact message
const sendContactMessage = asyncHandler(async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !phone || !message) {
    return sendError(res, 400, false, "All fields are required.");
  }

  const newMessage = await ContactMessage.create({
    name,
    email,
    phone,
    message,
  });

  return sendResponse(
    res,
    201,
    true,
    "Your message has been sent successfully.",
    newMessage
  );
});

const getAllContactMessages = asyncHandler(async (req, res) => {
  const messages = await ContactMessage.find().sort({ createdAt: -1 });

  return sendResponse(
    res,
    200,
    true,
    "Contact messages fetched successfully.",
    messages
  );
});

module.exports = {
  sendContactMessage,
  getAllContactMessages,
};
