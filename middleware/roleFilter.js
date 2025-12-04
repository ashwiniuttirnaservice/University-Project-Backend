const mongoose = require("mongoose");

const roleFilter = (req, res, next) => {
  try {
    const { role, trainerId, studentId } = req.user;

    req.roleFilter = {};

    if (role === "admin") {
      req.roleFilter = {};
    } else if (role === "trainer" && trainerId) {
      req.roleFilter = {
        trainersAssigned: new mongoose.Types.ObjectId(trainerId),
      };
    } else if (role === "student" && studentId) {
      req.roleFilter = {
        studentsAssigned: new mongoose.Types.ObjectId(studentId),
      };
    }

    next();
  } catch (err) {
    console.log("RoleFilter Error:", err);
    req.roleFilter = {};
    next();
  }
};

module.exports = roleFilter;
