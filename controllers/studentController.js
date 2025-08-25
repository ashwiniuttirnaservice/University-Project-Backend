const Student = require("../models/Student");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");
const mongoose = require("mongoose");

exports.registerCandidate = asyncHandler(async (req, res) => {
  const { fullName, mobileNo, email, dob, collegeName, selectedProgram } =
    req.body;

  const existingCandidate = await Student.findOne({
    $or: [{ email }, { mobileNo }],
  });

  if (existingCandidate) {
    return sendError(
      res,
      400,
      false,
      "Candidate already registered with this email or phone."
    );
  }

  const newCandidate = await Student.create({
    fullName,
    mobileNo,
    email,
    dob,
    collegeName,
    selectedProgram,
  });

  return sendResponse(
    res,
    201,
    true,
    "Candidate registered successfully!",
    newCandidate
  );
});

exports.registerStudent = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    mobileNo,
    dob,
    gender,
    address,
    currentEducation,
    status,
    boardUniversityCollege,
    coursesInterested,
    preferredBatchTiming,
    preferredMode,
    password,
    enrolledCourses,
  } = req.body;

  const existing = await Student.findOne({ email });
  if (existing) return sendError(res, 400, false, "Email already registered");

  const parsedAddress =
    typeof address === "string" ? JSON.parse(address) : address;

  let parsedCourses = [];
  if (Array.isArray(enrolledCourses)) {
    parsedCourses = enrolledCourses;
  } else if (typeof enrolledCourses === "string") {
    try {
      parsedCourses = JSON.parse(enrolledCourses);
      if (!Array.isArray(parsedCourses)) parsedCourses = [parsedCourses];
    } catch {
      parsedCourses = [enrolledCourses];
    }
  }

  const student = await Student.create({
    fullName,
    email,
    mobileNo,
    dob,
    gender,
    address: parsedAddress,
    currentEducation,
    status,
    boardUniversityCollege,
    coursesInterested: Array.isArray(coursesInterested)
      ? coursesInterested
      : coursesInterested?.split(","),
    preferredBatchTiming,
    preferredMode,
    password,

    enrolledCourses: parsedCourses,
    idProofStudent: req.files?.idProofStudent?.[0]?.filename || "",
    profilePhotoStudent: req.files?.profilePhotoStudent?.[0]?.filename || "",
  });

  return sendResponse(res, 201, true, "Student registered", {
    _id: student._id,
    fullName: student.fullName,
    email: student.email,
    enrolledCourses: student.enrolledCourses,
  });
});

// @desc    Get all students
exports.getAllStudents = asyncHandler(async (req, res) => {
  const students = await Student.aggregate([
    {
      $lookup: {
        from: "branches",
        localField: "branch",
        foreignField: "_id",
        as: "branch",
      },
    },
    { $unwind: { path: "$branch", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "courses",
        localField: "enrolledCourses",
        foreignField: "_id",
        as: "enrolledCourses",
      },
    },
    {
      $project: {
        password: 0,
      },
    },
  ]);

  return sendResponse(res, 200, true, "All students fetched", students);
});

// @desc    Get single student
exports.getStudentById = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId;

  const result = await Student.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(studentId) } },
    {
      $lookup: {
        from: "branches",
        localField: "branch",
        foreignField: "_id",
        as: "branch",
      },
    },
    { $unwind: { path: "$branch", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "courses",
        localField: "enrolledCourses",
        foreignField: "_id",
        as: "enrolledCourses",
      },
    },
    {
      $project: {
        password: 0,
      },
    },
  ]);

  if (!result || result.length === 0)
    return sendError(res, 404, false, "Student not found");

  return sendResponse(res, 200, true, "Student found", result[0]);
});

exports.updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.studentId);
  if (!student) return sendError(res, 404, false, "Student not found");

  const updateData = {
    ...req.body,
  };

  if (typeof req.body.address === "string") {
    updateData.address = JSON.parse(req.body.address);
  }

  if (req.files?.idProofStudent?.[0]) {
    updateData.idProofStudent = req.files.idProofStudent[0].filename;
  }

  if (req.files?.profilePhotoStudent?.[0]) {
    updateData.profilePhotoStudent = req.files.profilePhotoStudent[0].filename;
  }

  const updatedStudent = await Student.findByIdAndUpdate(
    req.params.studentId,
    updateData,
    { new: true }
  ).select("-password");

  return sendResponse(res, 200, true, "Student updated", updatedStudent);
});

exports.deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.studentId);
  if (!student) return sendError(res, 404, false, "Student not found");

  await student.deleteOne();
  return sendResponse(res, 200, true, "Student deleted");
});
