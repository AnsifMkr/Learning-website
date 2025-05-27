const express = require('express');
const multer = require('multer');
const {protect} = require('../middleware/authMiddleware');
const {
  getProfile,
  uploadAvatar,
  getProgress,
  completeLesson
} = require('../controllers/userController');
const router = express.Router();

// Multer setup — store uploads in public/avatars
const upload = multer({ dest: 'public/avatars/' });

/**
 * @route   GET /api/users/profile
 * @desc    Get the authenticated user's profile
 * @access  Protected
 */
router.get('/profile', protect, getProfile);

/**
 * @route   POST /api/users/avatar
 * @desc    Upload or change the user's avatar
 * @access  Protected
 */
router.post(
  '/avatar',
  protect,
  upload.single('avatar'),
  uploadAvatar
);

/**
 * @route   GET /api/users/progress
 * @desc    Fetch user's lesson progress, XP, and badges
 * @access  Protected
 */
router.get('/progress', protect, getProgress);

/**
 * @route   POST /api/users/complete-lesson
 * @desc    Mark a lesson as completed and award XP
 * @body    { lessonId: string }
 * @access  Protected
 */
router.post('/complete-lesson', protect, completeLesson);

module.exports = router;
