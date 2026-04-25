const User = require('../models/User');
const imagekit = require('../utils/imagekit');
const { generateQuizInternal } = require('./quizController');
const { checkAndAwardBadges } = require('../utils/gamification');

/**
 * GET /api/users/profile
 * Returns the authenticated user's profile (minus password).
 * req.user is set by authMiddleware.
 */
exports.getProfile = (req, res) => {
  const userObj = req.user.toObject ? req.user.toObject() : req.user;
  const { password, clerkId, yearlyActivity, ...userWithoutPassword } = userObj;
  
  // Explicitly convert Map to object for JSON serialization safety
  const safeYearlyActivity = req.user.yearlyActivity ? Object.fromEntries(req.user.yearlyActivity) : {};
  
  res.json({
    ...userWithoutPassword,
    yearlyActivity: safeYearlyActivity
  });
};

/**
 * PUT /api/users/profile
 * Updates the user profile fields: name, username
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, username } = req.body;
    
    // Check if username is already taken by someone else
    if (username && username !== req.user.username) {
      const existing = await User.findOne({ username });
      if (existing) {
        return res.status(400).json({ error: 'Username is already taken' });
      }
    }

    if (name) req.user.name = name;
    if (username) req.user.username = username;

    await req.user.save();
    
    const { password, ...updatedUser } = req.user.toObject();
    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/users/avatar
 * Uploads a new avatar image to ImageKit and updates user.avatarUrl.
 */
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check if ImageKit is properly configured
    if (!process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
      console.error('ImageKit configuration missing');
      return res.status(500).json({ error: 'Image upload service not configured' });
    }

    // Upload file buffer directly to ImageKit
    console.log('Uploading to ImageKit:', {
      fileName: `avatar_${req.user._id}_${Date.now()}_${req.file.originalname}`,
      folder: '/avatars',
      fileSize: req.file.size,
      mimetype: req.file.mimetype
    });

    const response = await imagekit.files.upload({
      file: req.file.buffer, // Use buffer directly
      fileName: `avatar_${req.user._id}_${Date.now()}_${req.file.originalname}`,
      folder: '/avatars',
      useUniqueFileName: true,
    });

    console.log('ImageKit upload response:', response);

    req.user.avatarUrl = response.url;
    await req.user.save();

    res.json({ avatarUrl: response.url });
  } catch (err) {
    console.error('Avatar upload error details:', {
      message: err.message,
      stack: err.stack,
      code: err.code,
      statusCode: err.statusCode
    });

    // Provide more specific error messages
    if (err.message && err.message.includes('ImageKit')) {
      return res.status(500).json({ error: 'Image upload service error' });
    }

    // For other errors, use generic message
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
};

/**
 * GET /api/users/progress
 * Returns xp, completedLessons, and badges for the authenticated user.
 */
exports.getProgress = (req, res) => {
  const { xp, completedLessons, completedQuizzes, badges } = req.user;
  res.json({ xp, completedLessons, completedQuizzes, badges });
};

/**
 * POST /api/users/complete-lesson
 * Marks a lesson as completed, adds XP, awards badges, and generates a quiz automatically.
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

      // ── Yearly streak logic (GitHub-style) ───────────────────────────
      const today = new Date();
      const dateKey = today.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Increment activity count for today
      if (!req.user.yearlyActivity) {
        req.user.yearlyActivity = new Map();
      }
      req.user.yearlyActivity.set(dateKey, (req.user.yearlyActivity.get(dateKey) || 0) + 1);
      
      // Calculate consecutive days streak
      let streakCount = 1;
      let checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - 1); // Start from yesterday
      
      while (true) {
        const checkDateKey = checkDate.toISOString().split('T')[0];
        if (req.user.yearlyActivity.has(checkDateKey)) {
          streakCount++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
      
      req.user.currentYearStreak = streakCount;
      
      if (req.user.currentYearStreak > req.user.longestStreak) {
        req.user.longestStreak = req.user.currentYearStreak;
      }
      // ────────────────────────────────────────────────────────────────

      // Trigger gamification engine
      const newlyAwardedBadges = checkAndAwardBadges(req.user);

      await req.user.save();

      // Kick off quiz generation in the background — don't block the response
      generateQuizInternal(lessonId).catch(err => {
        console.error('Quiz generation failed in the background:', err.message);
      });
    }

    res.json({
      xp: req.user.xp,
      completedLessons: req.user.completedLessons,
      badges: req.user.badges,
      newBadges: newlyAwardedBadges || [], // Frontend can use this to show Toast alerts if returned from completeLesson
      currentYearStreak: req.user.currentYearStreak,
      longestStreak: req.user.longestStreak,
      yearlyActivity: Object.fromEntries(req.user.yearlyActivity || new Map()),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/leaderboard
 * Fetches the top 20 users sorted by XP.
 */
exports.getLeaderboard = async (req, res, next) => {
  try {
    const topUsers = await User.find({ role: 'user' })
      .sort({ xp: -1 })
      .limit(20)
      .select('name username avatarUrl badges xp completedLessons currentStreak -_id')
      .lean();
    
    res.json(topUsers);
  } catch (err) {
    next(err);
  }
};
