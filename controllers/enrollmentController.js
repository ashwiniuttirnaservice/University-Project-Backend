const mongoose = require("mongoose");
const Batch = require("../models/Batch");
const Course = require("../models/Course");
const asyncHandler = require("../middleware/asyncHandler");
const { sendResponse, sendError } = require("../utils/apiResponse");
const Student = require("../models/Student");
const Enrollment = require("../models/Enrollment.js");
exports.enrollInCourse = asyncHandler(async (req, res) => {
  const { course, studentId } = req.body;

  if (!course || !studentId) {
    return sendError(res, 400, false, "Course ID and Student ID are required");
  }

  const courses = await Course.findById(course);
  if (!courses) return sendError(res, 404, false, "Course not found");

  const existing = await Enrollment.findOne({
    course: courses._id,
    studentId,
  });
  if (existing)
    return sendError(res, 400, false, "Already enrolled in this course");

  const enrollment = await Enrollment.create({
    course: courses._id,
    studentId,
  });

  const populated = await Enrollment.findById(enrollment._id)
    .populate("studentId")
    .populate("course", "title description");

  return sendResponse(res, 201, true, "Enrolled successfully", populated);
});

exports.getMyEnrollments = asyncHandler(async (req, res) => {
  const studentId = req.user?.studentId;

  if (!studentId) {
    return sendError(res, 401, false, "Student not authorized");
  }

  const enrollments = await Enrollment.aggregate([
    {
      $lookup: {
        from: "courses",
        localField: "enrolledCourses",
        foreignField: "_id",
        as: "courseDetails",
      },
    },
    { $unwind: "$courseDetails" },
    {
      $lookup: {
        from: "branches",
        localField: "courseDetails.branch",
        foreignField: "_id",
        as: "branchDetails",
      },
    },
    { $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "students",
        localField: "studentId",
        foreignField: "_id",
        as: "studentDetails",
      },
    },
    { $unwind: "$studentDetails" },
    {
      $project: {
        _id: 1,
        enrolledAt: 1,
        completedContent: 1,
        student: {
          _id: "$studentDetails._id",
          fullName: "$studentDetails.fullName",
          mobileNo: "$studentDetails.mobileNo",
          email: "$studentDetails.email",
        },
        course: {
          _id: "$courseDetails._id",
          title: "$courseDetails.title",
          description: "$courseDetails.description",
          duration: "$courseDetails.duration",
          overview: "$courseDetails.overview",
          learningOutcomes: "$courseDetails.learningOutcomes",
          benefits: "$courseDetails.benefits",
          keyFeatures: "$courseDetails.keyFeatures",
          features: "$courseDetails.features",
          videolectures: "$courseDetails.videolectures",
          notes: "$courseDetails.notes",
          trainer: "$courseDetails.trainer",
          branch: "$branchDetails.name",
        },
      },
    },
    { $sort: { enrolledAt: -1 } },
  ]);

  return sendResponse(res, 200, true, "All enrollments fetched", enrollments);
});

exports.markContentAsComplete = asyncHandler(async (req, res) => {
  const { enrollmentId } = req.params;
  const { contentId } = req.body;
  const userId = req.user.id;

  if (!contentId) return sendError(res, 400, false, "Content ID is required");

  const enrollment = await Enrollment.findById(enrollmentId).populate("course");
  if (!enrollment) return sendError(res, 404, false, "Enrollment not found");
  if (enrollment.user.toString() !== userId)
    return sendError(res, 403, false, "Unauthorized");

  const validContent = [
    ...enrollment.course.youtubeVideos.map((v) => v._id.toString()),
    ...enrollment.course.notes.map((n) => n._id.toString()),
  ];

  if (!validContent.includes(contentId))
    return sendError(res, 404, false, "Invalid content");

  if (!enrollment.completedContent.includes(contentId)) {
    enrollment.completedContent.push(contentId);
    await enrollment.save();
  }

  return sendResponse(res, 200, true, "Content marked complete", enrollment);
});

exports.markContentAsIncomplete = asyncHandler(async (req, res) => {
  const { enrollmentId } = req.params;
  const { contentId } = req.body;
  const userId = req.user.id;

  if (!contentId) return sendError(res, 400, false, "Content ID is required");

  const enrollment = await Enrollment.findById(enrollmentId);
  if (!enrollment) return sendError(res, 404, false, "Enrollment not found");
  if (enrollment.user.toString() !== userId)
    return sendError(res, 403, false, "Unauthorized");

  enrollment.completedContent = enrollment.completedContent.filter(
    (id) => id.toString() !== contentId
  );
  await enrollment.save();

  return sendResponse(res, 200, true, "Content marked incomplete", enrollment);
});

exports.getAllEnrollmentsAdmin = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find()
    .populate({
      path: "studentId",
      select:
        "fullName email mobileNo selectedProgram enrolledCourses coursesInterested profilePhotoStudent registeredAt",
    })
    .populate({
      path: "enrolledCourses",
      select: "title category duration",
    })
    .populate({
      path: "enrolledBatches",
      select: "batchName timing trainers",
      populate: {
        path: "trainersAssigned",
        select: "firstName lastName email",
      },
    })
    .sort({ enrolledAt: -1 });

  if (!enrollments || enrollments.length === 0) {
    return sendResponse(
      res,
      200,
      true,
      "All enrollments fetched successfully.",
      []
    );
  }

  const formattedResponse = enrollments.map((enrollment) => ({
    student: {
      _id: enrollment.studentId?._id,
      fullName: enrollment.studentId?.fullName || enrollment.fullName,
      email: enrollment.studentId?.email || enrollment.email,
      mobileNo: enrollment.studentId?.mobileNo || enrollment.mobileNo,
      selectedProgram:
        enrollment.studentId?.selectedProgram ||
        enrollment.enrolledCourses?.[0]?.title ||
        "",
      enrolledCourses: enrollment.studentId?.enrolledCourses?.length
        ? enrollment.studentId.enrolledCourses
        : enrollment.enrolledCourses.map((c) => ({
            _id: c._id,
            title: c.title,
          })),
      coursesInterested: enrollment.studentId?.coursesInterested || [],
      profilePhotoStudent: enrollment.studentId?.profilePhotoStudent || "",
      registeredAt: enrollment.studentId?.registeredAt || enrollment.createdAt,
      __v: enrollment.studentId?.__v || 0,
    },
    enrollment: {
      _id: enrollment._id,
      studentId: enrollment.studentId?._id,
      enrolledCourses: enrollment.enrolledCourses.map((c) => ({
        _id: c._id,
        title: c.title,
      })),
      enrolledBatches: enrollment.enrolledBatches.map((b) => ({
        _id: b._id,
        batchName: b.batchName,
        timing: b.timing,
        trainers: b.trainers?.map((t) => ({
          _id: t._id,
          fullName: `${t.firstName} ${t.lastName}`.trim(),
          email: t.email,
        })),
      })),
      coursesInterested: enrollment.coursesInterested,
      fullName: enrollment.fullName,
      mobileNo: enrollment.mobileNo,
      email: enrollment.email,
      enrolledAt: enrollment.enrolledAt,
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.updatedAt,
      __v: enrollment.__v || 0,
    },
  }));

  return sendResponse(
    res,
    200,
    true,
    "All enrollments fetched successfully.",
    formattedResponse
  );
});

exports.getEnrollmentByIdAdmin = asyncHandler(async (req, res) => {
  const enrollmentId = new mongoose.Types.ObjectId(req.params.id);

  const enrollment = await Enrollment.aggregate([
    { $match: { _id: enrollmentId } },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    { $unwind: "$userDetails" },
    {
      $lookup: {
        from: "courses",
        localField: "course",
        foreignField: "_id",
        as: "courseDetails",
      },
    },
    { $unwind: "$courseDetails" },
    {
      $lookup: {
        from: "branches",
        localField: "courseDetails.branch",
        foreignField: "_id",
        as: "branchDetails",
      },
    },
    { $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        enrolledAt: 1,
        completedContent: 1,
        user: {
          firstName: "$userDetails.firstName",
          lastName: "$userDetails.lastName",
          email: "$userDetails.email",
          role: "$userDetails.role",
          branch: "$userDetails.branch",
        },
        course: {
          title: "$courseDetails.title",
          description: "$courseDetails.description",
          branch: "$branchDetails.name",
        },
      },
    },
  ]);

  if (!enrollment || enrollment.length === 0) {
    return sendError(res, 404, false, "Enrollment not found");
  }

  return sendResponse(res, 200, true, "Enrollment fetched", enrollment[0]);
});

exports.unenrollFromCourse = asyncHandler(async (req, res) => {
  const enrollmentId = req.params.id;
  const currentUser = req.user;

  const enrollment = await Enrollment.findById(enrollmentId);
  if (!enrollment) return sendError(res, 404, false, "Enrollment not found");

  if (
    currentUser.role !== "admin" &&
    enrollment.user.toString() !== currentUser.id
  ) {
    return sendError(res, 403, false, "Not authorized to unenroll");
  }

  await enrollment.deleteOne();
  return sendResponse(res, 200, true, "Unenrolled successfully");
});
exports.createEnrollment = asyncHandler(async (req, res) => {
  const {
    fullName,
    mobileNo,
    email,
    collegeName,
    enrolledCourses,
    enrolledBatches,
  } = req.body;

  if (!mobileNo) {
    return sendError(res, 400, false, "Mobile number is required");
  }

  let student = await Student.findOne({ mobileNo });
  let enrollment;

  if (student) {
    let updated = false;

    if (enrolledCourses && enrolledCourses.length > 0) {
      const newCourses = enrolledCourses.filter(
        (course) => !student.enrolledCourses.includes(course)
      );
      if (newCourses.length > 0) {
        student.enrolledCourses.push(...newCourses);
        updated = true;
      }
    }

    if (enrolledBatches && enrolledBatches.length > 0) {
      const newBatches = enrolledBatches.filter(
        (batch) => !student.enrolledBatches.includes(batch)
      );
      if (newBatches.length > 0) {
        student.enrolledBatches.push(...newBatches);
        updated = true;
      }
    }

    if (!updated) {
      enrollment = await Enrollment.findOne({ studentId: student._id });
      return sendResponse(
        res,
        200,
        true,
        "Student already enrolled in same course(s)/batch(es).",
        {
          student,
          enrollment,
        }
      );
    }

    await student.save();

    enrollment = await Enrollment.findOne({ studentId: student._id });
    if (enrollment) {
      enrollment.enrolledCourses = student.enrolledCourses;
      enrollment.enrolledBatches = student.enrolledBatches;
      await enrollment.save();
    } else {
      enrollment = await Enrollment.create({
        studentId: student._id,
        fullName: student.fullName,
        mobileNo: student.mobileNo,
        email: student.email,
        collegeName: student.collegeName,
        enrolledCourses: student.enrolledCourses,
        enrolledBatches: student.enrolledBatches,
      });
    }

    return sendResponse(
      res,
      200,
      true,
      "Student enrollment updated successfully.",
      {
        student,
        enrollment,
      }
    );
  }

  if (!fullName || !email || !enrolledCourses) {
    return sendError(
      res,
      400,
      false,
      "All required fields must be filled for new enrollment."
    );
  }

  student = await Student.create({
    fullName,
    mobileNo,
    email,
    collegeName,
    enrolledCourses,
    enrolledBatches,
  });

  enrollment = await Enrollment.create({
    studentId: student._id,
    fullName,
    mobileNo,
    email,
    collegeName,
    enrolledCourses,
    enrolledBatches,
  });

  return sendResponse(res, 201, true, "Enrollment created successfully", {
    student,
    enrollment,
  });
});

exports.createStudentEnrollmentByAdmin = asyncHandler(async (req, res) => {
  const { fullName, mobileNo, email, coursesInterested, enrolledBatches } =
    req.body;

  // 1️⃣ Validation
  if (
    !fullName ||
    !mobileNo ||
    !email ||
    !coursesInterested ||
    !enrolledBatches
  ) {
    return sendError(
      res,
      400,
      false,
      "All fields are required: fullName, mobileNo, email, coursesInterested, enrolledBatches"
    );
  }

  // 2️⃣ Check if student exists or create new
  let student = await Student.findOne({ email });

  if (!student) {
    student = await Student.create({
      fullName,
      mobileNo,
      email,
      isActive: true,
      status: "Enrolled",
    });
  }

  // 3️⃣ Create enrollment record
  const enrollment = await Enrollment.create({
    studentId: student._id,
    fullName,
    mobileNo,
    email,
    coursesInterested: coursesInterested.map(
      (id) => new mongoose.Types.ObjectId(id)
    ),
    enrolledBatches: enrolledBatches.map(
      (id) => new mongoose.Types.ObjectId(id)
    ),
    enrolledAt: new Date(),
  });

  // 4️⃣ Add student details to each batch
  for (const batchId of enrolledBatches) {
    await Batch.findByIdAndUpdate(
      batchId,
      {
        // ✅ Add only if not already present
        $addToSet: { enrolledIds: student._id },
        $inc: { studentCount: 1 },
        // ✅ Add full student info in `students` array
        $push: {
          students: {
            studentId: student._id,
            fullName: student.fullName,
            email: student.email,
            mobileNo: student.mobileNo,
          },
        },
      },
      { new: true }
    );
  }

  // 5️⃣ Response
  return sendResponse(
    res,
    201,
    true,
    "Student enrolled successfully by admin",
    {
      student,
      enrollment,
    }
  );
});

exports.updateStudentEnrollmentByAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { fullName, mobileNo, email, coursesInterested, enrolledBatches } =
    req.body;

  if (!id) {
    return sendError(res, 400, false, "Enrollment ID is required");
  }

  const existingEnrollment = await Enrollment.findById(id);
  if (!existingEnrollment) {
    return sendError(res, 404, false, "Enrollment not found");
  }

  let student = await Student.findById(existingEnrollment.studentId);
  if (!student) {
    return sendError(res, 404, false, "Student not found");
  }

  student.fullName = fullName || student.fullName;
  student.mobileNo = mobileNo || student.mobileNo;
  student.email = email || student.email;
  await student.save();

  existingEnrollment.fullName = student.fullName;
  existingEnrollment.mobileNo = student.mobileNo;
  existingEnrollment.email = student.email;
  existingEnrollment.coursesInterested = coursesInterested
    ? coursesInterested.map((id) => new mongoose.Types.ObjectId(id))
    : existingEnrollment.coursesInterested;
  existingEnrollment.enrolledBatches = enrolledBatches
    ? enrolledBatches.map((id) => new mongoose.Types.ObjectId(id))
    : existingEnrollment.enrolledBatches;
  existingEnrollment.updatedAt = new Date();
  await existingEnrollment.save();

  const oldBatchIds = existingEnrollment.enrolledBatches.map((id) =>
    id.toString()
  );
  const newBatchIds = enrolledBatches.map((id) => id.toString());

  const removedBatches = oldBatchIds.filter((id) => !newBatchIds.includes(id));
  const addedBatches = newBatchIds.filter((id) => !oldBatchIds.includes(id));

  if (removedBatches.length > 0) {
    await Batch.updateMany(
      { _id: { $in: removedBatches } },
      {
        $pull: {
          enrolledIds: student._id,
          students: { studentId: student._id },
        },
        $inc: { studentCount: -1 },
      }
    );
  }

  for (const batchId of addedBatches) {
    await Batch.findByIdAndUpdate(
      batchId,
      {
        $addToSet: { enrolledIds: student._id },
        $inc: { studentCount: 1 },
        $push: {
          students: {
            studentId: student._id,
            fullName: student.fullName,
            email: student.email,
            mobileNo: student.mobileNo,
          },
        },
      },
      { new: true }
    );
  }

  await Batch.updateMany(
    { "students.studentId": student._id },
    {
      $set: {
        "students.$[elem].fullName": student.fullName,
        "students.$[elem].email": student.email,
        "students.$[elem].mobileNo": student.mobileNo,
      },
    },
    { arrayFilters: [{ "elem.studentId": student._id }] }
  );

  return sendResponse(
    res,
    200,
    true,
    "Student enrollment updated successfully",
    {
      student,
      enrollment: existingEnrollment,
    }
  );
});

exports.getEnrollmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, false, "Invalid enrollment ID");
  }

  const enrollmentId = new mongoose.Types.ObjectId(id);

  const enrollment = await Enrollment.aggregate([
    { $match: { _id: enrollmentId } },

    {
      $lookup: {
        from: "courses",
        localField: "enrolledCourses",
        foreignField: "_id",
        as: "enrolledCourses",
      },
    },

    {
      $lookup: {
        from: "batches",
        localField: "enrolledBatches",
        foreignField: "_id",
        as: "enrolledBatches",
      },
    },

    {
      $lookup: {
        from: "assignments",
        localField: "enrolledCourses",
        foreignField: "course",
        as: "assignments",
      },
    },

    {
      $lookup: {
        from: "attendances",
        localField: "studentId",
        foreignField: "student",
        as: "attendance",
      },
    },

    {
      $lookup: {
        from: "events",
        localField: "enrolledBatches",
        foreignField: "batch",
        as: "events",
      },
    },

    {
      $lookup: {
        from: "webinars",
        localField: "enrolledCourses",
        foreignField: "course",
        as: "webinars",
      },
    },

    {
      $lookup: {
        from: "internships",
        localField: "studentId",
        foreignField: "student",
        as: "internships",
      },
    },

    {
      $lookup: {
        from: "workshops",
        localField: "enrolledCourses",
        foreignField: "course",
        as: "workshops",
      },
    },
  ]);

  if (!enrollment || enrollment.length === 0) {
    return sendError(res, 404, false, "Enrollment not found");
  }

  return sendResponse(
    res,
    200,
    true,
    "Enrollment details fetched successfully",
    enrollment[0]
  );
});
