const mongoose = require('mongoose');
const Quiz = require('./backend/models/Quiz');

mongoose.connect('mongodb://127.0.0.1:27017/learning-platform').then(async () => {
  const quizzes = await Quiz.find();
  for (let quiz of quizzes) {
    let modified = false;
    for (let q of quiz.questions) {
      if (q.correctAnswer.match(/^opt[1-4]$/i)) {
        const index = parseInt(q.correctAnswer.replace(/opt/i, '')) - 1;
        if (q.options[index]) {
          q.correctAnswer = q.options[index];
          modified = true;
        }
      } else if (q.correctAnswer.match(/^option[1-4]$/i)) {
        const index = parseInt(q.correctAnswer.replace(/option/i, '')) - 1;
        if (q.options[index]) {
          q.correctAnswer = q.options[index];
          modified = true;
        }
      } else if (q.correctAnswer.length === 1 && q.correctAnswer.match(/^[a-d1-4]$/i)) {
        let index = -1;
        if (q.correctAnswer.match(/^[1-4]$/)) index = parseInt(q.correctAnswer) - 1;
        if (q.correctAnswer.toLowerCase() === 'a') index = 0;
        if (q.correctAnswer.toLowerCase() === 'b') index = 1;
        if (q.correctAnswer.toLowerCase() === 'c') index = 2;
        if (q.correctAnswer.toLowerCase() === 'd') index = 3;
        
        if (index >= 0 && q.options[index]) {
          q.correctAnswer = q.options[index];
          modified = true;
        }
      }
    }
    if (modified) {
      await quiz.save();
      console.log(`Fixed quiz ${quiz._id}`);
    }
  }
  console.log('Quizzes checked.');
  process.exit(0);
});
