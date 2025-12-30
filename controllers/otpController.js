const Otp = require("../models/OtpModel");
const smsModel = require("../models/smsModel.js");
const Student = require("../models/Student");
const crypto = require("crypto");
const Enrollment = require("../models/Enrollment");
const jwt = require("jsonwebtoken");
const { sendResponse, sendError } = require("../utils/apiResponse");
const asyncHandler = require("../middleware/asyncHandler");
const Event = require("../models/EventSession .js");
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const mongoose = require("mongoose");

const { sendPasswordEmail } = require("../models/emailService.js");
const { sendOtpEmail } = require("../models/emailService");
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

exports.sendOtp = asyncHandler(async (req, res) => {
  const { mobileNo } = req.body;

  if (!mobileNo) {
    return sendError(res, 400, false, "Mobile number is required");
  }

  let student = await Student.findOne({ mobileNo });
  if (!student) {
    student = await Student.create({
      mobileNo,
      role: "student",
      status: "Registered",
      isActive: true,
    });
  }

  const otp = generateOtp();
  const reference_id = crypto.randomBytes(8).toString("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  console.log(otp);
  await Otp.create({
    mobileNo,
    otp,
    reference_id,
    expiresAt,
  });

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
    studentId: student._id,
  });
});

exports.verifyOtp = asyncHandler(async (req, res) => {
  const { reference_id, otp } = req.body;

  const otpRecord = await Otp.findOne({ reference_id });
  if (!otpRecord) return sendError(res, 404, false, "Invalid reference ID");

  if (otpRecord.is_verified)
    return sendError(res, 400, false, "OTP already verified");

  if (otpRecord.expiresAt < new Date()) {
    return sendError(res, 400, false, "OTP expired");
  }

  if (otp !== otpRecord.otp) {
    return sendError(res, 400, false, "Invalid OTP");
  }

  otpRecord.is_verified = true;
  await otpRecord.save();

  const student = await Student.findOne({ mobileNo: otpRecord.mobileNo });
  if (!student) return sendError(res, 404, false, "Student not found");

  const firstCourseId = student.enrolledCourses?.[0]?._id || null;

  const tokenPayload = {
    studentId: student._id,
    courseId: firstCourseId,
    role: "student",
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "7d" });

  return sendResponse(res, 200, true, "OTP verified successfully", {
    mobileNo: otpRecord.mobileNo,
    studentId: student._id,
    courseId: firstCourseId,
    role: "student",
    token,
  });
});

exports.registerStudent = asyncHandler(async (req, res) => {
  const { reference_id, ...studentData } = req.body;

  const otpRecord = await Otp.findOne({ reference_id, is_verified: true });
  if (!otpRecord) return sendError(res, 400, false, "OTP not verified");

  studentData.mobileNo = otpRecord.mobileNo;

  let student = await Student.findOne({ mobileNo: studentData.mobileNo });
  if (!student) {
    student = await Student.create(studentData);
  }

  const firstCourseId = student.enrolledCourses?.[0]?._id || null;

  const tokenPayload = {
    studentId: student._id,
    courseId: firstCourseId,
    role: "student",
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "7d" });

  return sendResponse(res, 201, true, "Student registered successfully", {
    student,
    courseId: firstCourseId,
    role: "student",
    token,
  });
});

function generateSixDigitPassword() {
  return crypto.randomInt(100000, 999999).toString();
}

const password = generateSixDigitPassword();
// console.log(password);
exports.sendPasswordEmailAPI = asyncHandler(async (req, res) => {
  const { email, fullName, mobileNo, selectedProgram } = req.body;
  if (!email) return sendError(res, 400, false, "Email is required");

  const password = generateSixDigitPassword(10);

  let student = await Student.findOne({ email });

  if (!student) {
    student = await Student.create({
      fullName: fullName || "Student",
      email,
      mobileNo,
      selectedProgram,
      password,
      role: "student",
      status: "Registered",
      isActive: true,
    });
  } else {
    student.password = password;
    await student.save();

    await Enrollment.updateMany(
      { studentId: student._id },
      { $set: { password } }
    );
  }

  try {
    await sendPasswordEmail(email, password);
  } catch (err) {
    console.log(err, "Sending email error");
    return sendError(res, 500, false, err?.message || "Failed to send email");
  }

  return sendResponse(res, 200, true, "Password sent successfully", {
    studentId: student._id,
    isNewStudent: !student,
  });
});

exports.sendEmailOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return sendError(res, 400, false, "Email is required");
  }

  let student = await Student.findOne({ email });
  if (!student) {
    student = await Student.create({
      email,
      role: "student",
      status: "Registered",
      isActive: true,
    });
  }

  const otp = generateOtp();
  const reference_id = crypto.randomBytes(8).toString("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await Otp.create({
    email,
    otp,
    reference_id,
    expiresAt,
  });

  console.log(otp);
  try {
    await sendOtpEmail(email, otp);
  } catch (err) {
    console.error("Email sending failed:", err.message);
  }

  return sendResponse(res, 200, true, "OTP sent successfully", {
    reference_id,
    studentId: student._id,
  });
});

exports.verifyEmailOtp = asyncHandler(async (req, res) => {
  const { reference_id, otp } = req.body;

  if (!reference_id || !otp) {
    return sendError(res, 400, false, "Reference ID and OTP are required");
  }

  const otpRecord = await Otp.findOne({ reference_id });

  if (!otpRecord) {
    return sendError(res, 404, false, "Invalid reference ID");
  }

  if (otpRecord.is_verified) {
    return sendError(res, 400, false, "OTP already verified");
  }

  if (otpRecord.expiresAt < new Date()) {
    return sendError(res, 400, false, "OTP expired");
  }

  if (String(otp) !== String(otpRecord.otp)) {
    return sendError(res, 400, false, "Invalid OTP");
  }

  otpRecord.is_verified = true;
  await otpRecord.save();

  const student = await Student.findOne({ email: otpRecord.email });

  if (!student) {
    return sendError(res, 404, false, "Student not found");
  }

  const tokenPayload = {
    studentId: student._id,
    role: "student",
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "7d" });

  return sendResponse(res, 200, true, "Email OTP verified successfully", {
    email: otpRecord.email,
    studentId: student._id,
    role: "student",
    token,
  });
});
