const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const {
  getProfile,
  uploadAvatar,
  getProgress,
  completeLesson
} = require('../controllers/userController');
const router = express.Router();

// Memory storage — no local disk writes
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @route   GET /api/users/profile
 * @desc    Get the authenticated user's profile
 * @access  Protected
 */
router.get('/profile', protect, getProfile);

/**
 * @route   POST /api/users/avatar
 * @desc    Upload or change the user's avatar via ImageKit
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

/**
 * @route   PUT /api/users/profile
 * @desc    Update the authenticated user's profile (name, username)
 * @access  Protected
 */
router.put('/profile', protect, require('../controllers/userController').updateProfile);

/**
 * @route   GET /api/users/leaderboard
 * @desc    Fetch leaderboard ranking
 * @access  Public
 */
router.get('/leaderboard', require('../controllers/userController').getLeaderboard);

module.exports = router;
