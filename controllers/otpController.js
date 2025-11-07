const Otp = require("../models/OtpModel");
const smsModel = require("../models/smsModel.js");
const Student = require("../models/Student");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { sendResponse, sendError } = require("../utils/apiResponse");
const asyncHandler = require("../middleware/asyncHandler");
const Event = require("../models/EventSession .js");
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

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

  const otp = generateOtp();
  const reference_id = crypto.randomBytes(8).toString("hex");
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

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
    studentId: existingStudent._id,
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

  // Get first enrolled course ID if exists
  const firstCourseId = student.enrolledCourses?.[0]?._id || null;

  // ✅ Generate JWT
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

exports.sendOtp1 = asyncHandler(async (req, res) => {
  const { mobileNo } = req.body;

  if (!mobileNo) {
    return sendError(res, 400, false, "Mobile number is required");
  }

  const existingStudent = await Student.findOne({ mobileNo });
  if (!existingStudent) {
    return sendError(res, 404, false, "Mobile number not found in our records");
  }

  const otp = generateOtp();
  const reference_id = crypto.randomBytes(8).toString("hex");
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await Otp.create({
    mobileNo,
    otp,
    reference_id,
    expiresAt,
  });

  let event = await Event.findOne({ eventType: "OTP_SENT" });

  if (!event) {
    event = await Event.create({
      studentIds: [existingStudent._id],
      eventType: "OTP_SENT",
      description: `OTP sent to ${mobileNo}`,
      status: "success",
    });
  } else {
    if (!event.studentIds.includes(existingStudent._id)) {
      event.studentIds.push(existingStudent._id);
    }
    event.description = `OTP sent to ${mobileNo}`;
    await event.save();
  }

  try {
    await smsModel.sendSMS({
      smsDetails: { mobile: mobileNo, otp },
      smsType: "OTP_SMS",
    });
  } catch (err) {
    console.error("SMS sending failed:", err.message);
    event.status = "failed";
    event.description = `OTP send failed for ${mobileNo}`;
    await event.save();
  }

  return sendResponse(res, 200, true, "OTP sent successfully", {
    reference_id,
    studentId: existingStudent._id,
    eventId: event._id,
  });
});
