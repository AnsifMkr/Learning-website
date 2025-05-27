const express = require('express');
const {
  getAllLessons,
  createLesson,
  getLessonById,
  getLessonsBySkillPath,
  createLessonBySkillPath
} = require('../controllers/lessonController');

const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

const router = express.Router();

/**
 * @route   GET /api/lessons
 * @desc    Public - Get all lessons
 */
router.get('/', getAllLessons);

/**
 * @route   GET /api/lessons/path/:skillPath
 * @desc    Protected - Get lessons by skill path (e.g., frontend, backend)
 */
router.get('/path/:skillPath', protect, getLessonsBySkillPath);

/**
 * @route   POST /api/lessons/path/:skillPath
 * @desc    Admin Only - Create a lesson under a specific skill path
 */
router.post('/path/:skillPath', protect, isAdmin, createLessonBySkillPath);

/**
 * @route   POST /api/lessons
 * @desc    Admin Only - Create a lesson without skill path (optional route)
 */
router.post('/', protect, isAdmin, createLesson);

/**
 * @route   GET /api/lessons/:id
 * @desc    Public - Get a lesson by ID
 */
router.get('/:id', getLessonById);

module.exports = router;
