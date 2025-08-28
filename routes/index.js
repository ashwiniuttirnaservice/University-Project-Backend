const express = require('express');

const authRoutes = require("./authRoutes");
const branchRoutes = require("./branchRoutes");
const courseRoutes = require("./courseRouter.js");
const enrollmentRoutes = require("./enrollmentRoutes");
const adminRoutes = require("./adminRoutes");
const testRoutes = require("./testRoutes");
const userRoutes = require("./userRoutes");
const feedbackRoutes = require("./feedbackRoutes");
const batcheRouter = require("./batchRoutes");
const trainerRouter = require("./trainerRouter");
const studentRouter = require("./studentRouter");
const contactRouter = require("./contactRouter.js");
const sessionCategoryRouter = require("./sessionCategoryRouter.js");
const EventSessionRouter = require("./eventRouter.js");
const webinarRouter = require("./webinarRouter.js");
const workshopRouter = require("./workshopRouter.js");
const OtpRouter = require("./otpRouter.js");
const VideoRouter = require("./videoRouter.js");
const NotesRouter = require("./noteRouter.js");
const internshipSessionsRouter = require("./internshipSessionRouter.js");
const SponsorshipRouter = require("./sponsorshipRouter.js");
const HackathonRouter = require("./hackathonRoutes.js");
const indexRouter = express.Router();

indexRouter.get('/', (req, res) => {
    res.send('LMS API is alive and running...');
});
// All routes grouped here
indexRouter.use('/auth', authRoutes);
indexRouter.use('/branches', branchRoutes);
indexRouter.use('/courses', courseRoutes);
indexRouter.use('/enrollments', enrollmentRoutes);
indexRouter.use('/admin', adminRoutes);
indexRouter.use('/tests', testRoutes);
indexRouter.use('/users', userRoutes);
indexRouter.use('/feedback', feedbackRoutes);
indexRouter.use('/batches', batcheRouter);
indexRouter.use('/contact', contactRouter);
// Trainer & Student routes/contact
indexRouter.use("/trainer", trainerRouter);
indexRouter.use("/student", studentRouter);
indexRouter.use("/session-category", sessionCategoryRouter);
indexRouter.use("/event", EventSessionRouter);
indexRouter.use("/webinars", webinarRouter);
indexRouter.use("/workshops", workshopRouter);
indexRouter.use("/otp", OtpRouter);
indexRouter.use("/videos", VideoRouter);
indexRouter.use("/notes", NotesRouter);
indexRouter.use("/internship-sessions", internshipSessionsRouter);
indexRouter.use("/sponsorship", SponsorshipRouter);
indexRouter.use("/hackathon", HackathonRouter);
module.exports = indexRouter;
