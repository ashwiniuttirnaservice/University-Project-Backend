const Otp = require("../models/OtpModel");
const { v4: uuidv4 } = require("uuid");
const smsModel = require("../models/smsModel.js");
const Student = require("../models/Student");
const crypto = require("crypto");
const { sendResponse, sendError } = require("../utils/apiResponse");
const asyncHandler = require("../middleware/asyncHandler");

// Generate random 6-digit OTP
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

exports.sendOtp = asyncHandler(async (req, res) => {
  const { mobileNo } = req.body;

  if (!mobileNo) {
    return sendError(res, 400, false, "Mobile number is required");
  }

  const existingStudent = await Student.findOne({ mobileNo });
  if (!existingStudent) {
    return sendError(res, 404, false, "Mobile number not found in our records");
  }

  const otp = generateOtp(); // dynamic OTP
  const reference_id = crypto.randomBytes(8).toString("hex");
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await Otp.create({
    mobileNo,
    otp,
    reference_id,
    expiresAt,
  });

  // ✅ Send OTP via SMS
  try {
    await smsModel.sendSMS({
      smsDetails: { mobile: mobileNo, otp },
      smsType: "OTP_SMS",
    });
  } catch (err) {
    console.error("SMS sending failed:", err.message);
  }

  return sendResponse(res, 200, true, "OTP sent successfully", {
    reference_id,
    studentId: existingStudent._id,
    // otp,   // ❌ Do NOT return OTP in response (for security)
  });
});

exports.verifyOtp = asyncHandler(async (req, res) => {
  const { reference_id, otp } = req.body;

  const otpRecord = await Otp.findOne({ reference_id });
  if (!otpRecord) return sendError(res, 404, "Invalid reference ID");

  if (otpRecord.is_verified) return sendError(res, 400, "OTP already verified");

  if (otpRecord.expiresAt < new Date()) {
    return sendError(res, 400, "OTP expired");
  }

  if (otp !== otpRecord.otp) {
    return sendError(res, 400, "Invalid OTP");
  }

  otpRecord.is_verified = true;
  await otpRecord.save();

  const student = await Student.findOne({ mobileNo: otpRecord.mobileNo });
  if (!student) return sendError(res, 404, "Student not found");

  return sendResponse(res, 200, true, "OTP verified successfully", {
    mobileNo: otpRecord.mobileNo,
    studentId: student._id,
  });
});

exports.registerStudent = asyncHandler(async (req, res) => {
  const { reference_id, ...studentData } = req.body;

  const otpRecord = await Otp.findOne({ reference_id, is_verified: true });
  if (!otpRecord) return sendError(res, 400, false, "OTP not verified");

  studentData.mobileNo = otpRecord.mobileNo;

  const student = await Student.create(studentData);

  return sendResponse(res, 201, true, {
    message: "Student registered successfully",
    data: student,
  });
});
