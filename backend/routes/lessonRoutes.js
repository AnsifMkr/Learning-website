const express = require('express');
const { getLessonsByCourse, getLessonBySlug, createLesson, updateLesson, deleteLesson } = require('../controllers/lessonController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

const router = express.Router({ mergeParams: true }); // mergeParams to access :courseSlug from parent

// GET  /api/courses/:courseSlug/lessons  → all lessons for this course
// POST /api/courses/:courseSlug/lessons  → create lesson (admin)
router.get('/lessons', getLessonsByCourse);
router.post('/lessons', protect, isAdmin, createLesson);

// GET    /api/courses/:courseSlug/:lessonSlug  → single lesson
// PUT    /api/courses/:courseSlug/:lessonSlug  → update lesson (admin)
// DELETE /api/courses/:courseSlug/:lessonSlug  → delete lesson (admin)
router.get('/:lessonSlug', getLessonBySlug);
router.put('/:lessonSlug', protect, isAdmin, updateLesson);
router.delete('/:lessonSlug', protect, isAdmin, deleteLesson);

module.exports = router;
