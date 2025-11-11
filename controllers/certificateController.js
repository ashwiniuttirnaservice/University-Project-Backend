const path = require("path");
const mongoose = require("mongoose");
const IQTest = require("../models/IqTest");
const Student = require("../models/Student");
const TestList = require("../models/Test");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");

exports.uploadCertificateAndReport = asyncHandler(async (req, res) => {
  const { testID, studentId, reportType } = req.body;

  if (!testID || !studentId)
    return sendError(
      res,
      400,
      false,
      "Missing required fields: testID or studentId"
    );

  const iqTest = await IQTest.findOne({
    testID: new mongoose.Types.ObjectId(testID),
    studentId: new mongoose.Types.ObjectId(studentId),
  });

  if (!iqTest)
    return sendError(res, 404, false, "IQ Test not found for given student");

  if (req.files?.certificate?.[0]) {
    const ext = path.extname(req.files.certificate[0].originalname);
    const filename = `certificate_${Date.now()}${ext}`;
    iqTest.certificate = filename;
  }

  if (req.files?.report?.[0]) {
    const ext = path.extname(req.files.report[0].originalname);
    const filename = `report_${Date.now()}${ext}`;
    iqTest.report = filename;
  }

  if (reportType !== undefined) iqTest.reportType = reportType;

  await iqTest.save();

  sendResponse(res, 200, true, "Certificate and report updated successfully", {
    certificate: iqTest.certificate
      ? `https://certificate.carrerjupeter.com/certificate/${studentId}/${testID}`
      : "",
    report: iqTest.report
      ? `https://certificate.carrerjupeter.com/report/${studentId}/${testID}`
      : "",
  });
});

exports.getIQTestDetails = asyncHandler(async (req, res) => {
  const { studentId, _id } = req.body;

  if (!studentId || !_id)
    return sendError(res, 400, false, "Missing studentId or IQ Test ID");

  const student = await Student.findById(studentId).select(
    "fullName mobileNo email"
  );
  if (!student) return sendError(res, 404, false, "Student not found");

  const iqTest = await IQTest.findById(_id).select(
    "studentId testID title correctAnswers wrongAnswers passingMarks totalQuestions totalMarks reportType marksGained"
  );
  if (!iqTest) return sendError(res, 404, false, "IQ Test result not found");

  const test = await TestList.findById(iqTest.testID).select("chapterId title");
  if (!test) return sendError(res, 404, false, "Test details not found");

  sendResponse(res, 200, true, "IQ Test details fetched successfully", {
    fullName: student.fullName,
    mobileNo: student.mobileNo,
    email: student.email,
    chapterId: test.chapterId,
    title: iqTest.title,
    correctAnswers: iqTest.correctAnswers,
    wrongAnswers: iqTest.wrongAnswers,
    totalQuestions: iqTest.totalQuestions,
    totalMarks: iqTest.totalMarks,
    passingMarks: iqTest.passingMarks,
    marksGained: iqTest.marksGained,
    reportType: iqTest.reportType,
  });
});
