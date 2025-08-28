const Otp = require("../models/OtpModel");
const Student = require("../models/Student");
const crypto = require("crypto");
const { sendResponse, sendError } = require("../utils/apiResponse");
const asyncHandler = require("../middleware/asyncHandler");

const FIXED_OTP = "123456";

exports.sendOtp = asyncHandler(async (req, res) => {
  const { mobileNo } = req.body;

  if (!mobileNo) {
    return sendError(res, 400, false, "Mobile number is required");
  }

  const existingStudent = await Student.findOne({ mobileNo });
  if (!existingStudent) {
    return sendError(res, 404, false, "Mobile number not found in our records");
  }

  const reference_id = crypto.randomBytes(8).toString("hex");
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await Otp.create({
    mobileNo,
    otp: FIXED_OTP,
    reference_id,
    expiresAt,
  });

  return sendResponse(res, 200, true, "OTP sent successfully", {
    otp: FIXED_OTP,
    reference_id: reference_id,
    studentId: existingStudent._id,
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

  if (otp !== FIXED_OTP) {
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
