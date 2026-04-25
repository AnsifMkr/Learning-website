const express = require('express');
const router = express.Router();
const multer = require('multer');
const imagekit = require('../utils/imagekit');
const { getAllCourses, getCourseBySlug, createCourse, updateCourse, deleteCourse } = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const lessonRoutes = require('./lessonRoutes');

// Use memory storage — no local disk writes
const upload = multer({ storage: multer.memoryStorage() });

// Upload Thumbnail route (MUST come before /:slug routes)
router.post('/thumbnail', protect, isAdmin, upload.single('thumbnail'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Convert buffer to base64 string — required by @imagekit/nodejs SDK
    const base64File = req.file.buffer.toString('base64');

    const response = await imagekit.files.upload({
      file: base64File,
      fileName: `thumbnail_${Date.now()}_${req.file.originalname}`,
      folder: '/thumbnails',
      useUniqueFileName: true,
    });

    console.log('Thumbnail uploaded to ImageKit:', response.url);
    res.json({ thumbnailUrl: response.url });
  } catch (err) {
    console.error('Thumbnail upload error:', err);
    next(err);
  }
});

router.get('/', getAllCourses);
router.post('/', protect, isAdmin, createCourse);

// Static /info/:slug routes MUST be declared before /:courseSlug to avoid catch-all conflict
router.get('/info/:slug', getCourseBySlug);
router.put('/info/:slug', protect, isAdmin, updateCourse);
router.delete('/info/:slug', protect, isAdmin, deleteCourse);

// Nest lesson routes: /api/courses/:courseSlug/lessons and /api/courses/:courseSlug/:lessonSlug
// Must come AFTER all static routes
router.use('/:courseSlug', lessonRoutes);

module.exports = router;
