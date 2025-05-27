const { Configuration, OpenAIApi } = require('openai');
const Quiz = require('../models/Quiz');
const Lesson = require('../models/Lesson');

const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


// POST /api/quizzes/generate/:lessonId
exports.generateQuiz = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    // Prompt engineering: ask GPT to create 3 MCQs
    const prompt = `
Create 5 multiple-choice questions (with 4 options each, one correct) 
based on the following lesson content. Return JSON:
{
  "questions": [
    {
      "question": "...",
      "options": ["opt1","opt2","opt3","opt4"],
      "correctAnswer": "opt2"
    }
  ]
}
Lesson content:
${lesson.content}
`;

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500
    });

    // Parse the assistant’s reply as JSON
    const text = completion.data.choices[0].message.content;
    const { questions } = JSON.parse(text);

    // Save to DB
    let quiz = await Quiz.findOne({ lessonId });
    if (quiz) {
      quiz.questions = questions;
    } else {
      quiz = new Quiz({ lessonId, questions });
    }
    await quiz.save();

    res.json({ quiz });
  } catch (err) {
    console.error('Quiz generation error:', err);
    next(err);
  }
};

// GET /api/quizzes/:lessonId  (existing)
exports.getQuizByLesson = async (req, res) => {
  const quiz = await Quiz.findOne({ lessonId: req.params.lessonId });
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  res.json(quiz);
};

// POST /api/quizzes/:lessonId/submit (existing)
exports.submitQuiz = async (req, res) => {
  const { answers } = req.body;
  const quiz = await Quiz.findOne({ lessonId: req.params.lessonId });
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

  let score = 0;
  quiz.questions.forEach((q, i) => {
    if (answers[i] === q.correctAnswer) score++;
  });
  res.json({ score, total: quiz.questions.length });
};
