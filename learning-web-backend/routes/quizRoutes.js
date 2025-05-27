const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  generateQuiz,
  getQuizByLesson,
  submitQuiz
} = require('../controllers/quizController');

const router = express.Router();

// Generate quiz via AI (admin or user)
router.post('/generate/:lessonId', protect, generateQuiz);

// Fetch generated quiz
router.get('/:lessonId', protect, getQuizByLesson);

// Submit answers
router.post('/:lessonId/submit', protect, submitQuiz);

module.exports = router;
