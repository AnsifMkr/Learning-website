const User = require('../models/User');
const fs = require('fs');
const path = require('path');

/**
 * GET /api/users/profile
 * Returns the authenticated user’s profile (minus password).
 * req.user is set by authMiddleware.
 */
exports.getProfile = (req, res) => {
  const { password, ...userWithoutPassword } = req.user.toObject ? req.user.toObject() : req.user;
  res.json(userWithoutPassword);
};

/**
 * POST /api/users/avatar
 * Uploads a new avatar image, saves it under /public/avatars, and updates user.avatarUrl.
 */
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Preserve file extension
    const ext = path.extname(req.file.originalname);
    const newPath = req.file.path + ext;
    fs.renameSync(req.file.path, newPath);

    // Build accessible URL
    const avatarUrl = `/avatars/${path.basename(newPath)}`;
    req.user.avatarUrl = avatarUrl;
    await req.user.save();

    res.json({ avatarUrl });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/progress
 * Returns xp, completedLessons, and badges for the authenticated user.
 */
exports.getProgress = (req, res) => {
  const { xp, completedLessons, badges } = req.user;
  res.json({ xp, completedLessons, badges });
};

/**
 * POST /api/users/complete-lesson
 * Marks a lesson as completed, adds XP, and awards badges if thresholds met.
 */
exports.completeLesson = async (req, res, next) => {
  try {
    const { lessonId } = req.body;
    if (!lessonId) {
      return res.status(400).json({ error: 'lessonId is required' });
    }

    // Add to completedLessons if not already there
    if (!req.user.completedLessons.includes(lessonId)) {
      req.user.completedLessons.push(lessonId);
      req.user.xp += 10; // award 10 XP per lesson

      // Example badge logic
      if (req.user.xp === 50) {
        req.user.badges.push('50 XP Achiever');
      }
      if (req.user.completedLessons.length === 5) {
        req.user.badges.push('First Five Lessons');
      }

      await req.user.save();
    }

    res.json({
      xp: req.user.xp,
      completedLessons: req.user.completedLessons,
      badges: req.user.badges
    });
  } catch (err) {
    next(err);
  }
};
