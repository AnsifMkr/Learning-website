const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  questions: [{
    question: String,
    options: [String],
    correctAnswer: String
  }],
  timeLimit: Number
});

module.exports = mongoose.model('Quiz', quizSchema);
