const express = require('express');
const router = express.Router();

const {
    createCourse,
    getAllCourses,
    getAllCourse,
    getCourseById,
    updateCourse,
    deleteCourse,
} = require('../controllers/courseController');

// POST /api/courses
router.post('/', createCourse);

// GET /api/courses
router.get('/', getAllCourses);

// GET /api/courses/all
router.get('/all', getAllCourse);

// GET /api/courses/:id (only matches valid MongoDB ObjectId)
router.get('/:id([0-9a-fA-F]{24})', getCourseById);

// PUT /api/courses/:id
router.put('/:id([0-9a-fA-F]{24})', updateCourse);

// DELETE /api/courses/:id
router.delete('/:id([0-9a-fA-F]{24})', deleteCourse);

module.exports = router;
