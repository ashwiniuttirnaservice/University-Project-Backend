const Workshop = require("../models/Workshopsession");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

// 📌 Create a new workshop registration
exports.registerWorkshop = asyncHandler(async (req, res) => {
  const {
    fullName,
    mobileNo,
    email,
    dob,
    collegeName,
    selectedProgram,
    paymentStatus,
    transactionId,
    status,
  } = req.body;

  // Basic validation
  if (
    !fullName ||
    !mobileNo ||
    !email ||
    !dob ||
    !collegeName ||
    !selectedProgram
  ) {
    return sendError(res, 400, false, "All required fields must be filled");
  }

  const workshop = await Workshop.create({
    fullName,
    mobileNo,
    email,
    dob,
    collegeName,
    selectedProgram,
    paymentStatus,
    transactionId,
    status,
  });

  return sendResponse(
    res,
    201,
    true,
    "Workshop registration successful",
    workshop
  );
});

// 📌 Get all workshop registrations
exports.getAllWorkshops = asyncHandler(async (req, res) => {
  const workshops = await Workshop.find().sort({ createdAt: -1 });
  return sendResponse(
    res,
    200,
    true,
    "Workshops fetched successfully",
    workshops
  );
});

// 📌 Get workshop by ID
exports.getWorkshopById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const workshop = await Workshop.findById(id);

  if (!workshop) {
    return sendError(res, 404, false, "Workshop not found");
  }

  return sendResponse(
    res,
    200,
    true,
    "Workshop fetched successfully",
    workshop
  );
});
