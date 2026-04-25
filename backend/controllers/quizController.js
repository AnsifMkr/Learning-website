const Quiz = require('../models/Quiz');
const Lesson = require('../models/Lesson');
const { GoogleGenAI } = require('@google/genai');
const { checkAndAwardBadges } = require('../utils/gamification');

const internalGenerateQuiz = async (lessonId) => {
  // Check if API key is present
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is missing');
  }

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw new Error('Lesson not found');

  const existingQuiz = await Quiz.findOne({ lessonId });
  if (existingQuiz) return existingQuiz;

  const prompt = `
Role: You are an expert Instructional Designer and Subject Matter Expert.
Task: Generate a comprehensive assessment based on the provided lesson text.

Instructions:
1. Analyze Length: If the lesson is short, provide 3–5 high-impact questions. If the lesson is long, provide 10–15 questions.
2. Prioritize Importance: Focus 70% of the questions on "Core Concepts" and "Critical Functions" found in the text. Focus 30% on edge cases or syntax details.
3. Question Distribution:
   - Theory (MCQ): Conceptual "Why" and "How" questions.
   - Coding (MCQ): Provide a code snippet and ask for the output, the missing line, or the bug fix. Use Markdown for code blocks.
   - True/False: Focus on common misconceptions or fundamental rules.
4. Quality Standard: 
   - Distractors (wrong answers) must be plausible.
   - Avoid "All of the above" or "None of the above."

CRITICAL FORMATTING INSTRUCTION:
Return strictly a JSON object matching the exact schema below. The "correctAnswer" field MUST contain the EXACT string text of the correct option from the "options" array. DO NOT use an index like "opt2" or "B".

{
  "questions": [
    {
      "question": "[Type: Theory/Coding/TF] The text of the question...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option B",
      "explanation": "A 2-3 sentence explanation of why this is the correct answer"
    }
  ]
}

Lesson content:
${lesson.content}
`;

  const ai = new GoogleGenAI({});
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    }
  });

  const text = response.text;
  const cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const { questions } = JSON.parse(cleanedText);

  const newQuiz = new Quiz({ lessonId, questions });
  await newQuiz.save();
  return newQuiz;
};

exports.generateQuizInternal = internalGenerateQuiz;

// POST /api/quizzes/generate/:lessonSlug
exports.generateQuiz = async (req, res, next) => {
  try {
    const lesson = await Lesson.findOne({ slug: req.params.lessonSlug });
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    const quiz = await internalGenerateQuiz(lesson._id);
    res.json({ quiz });
  } catch (err) {
    if (err.message === 'Lesson not found') {
      return res.status(404).json({ error: err.message });
    }
    console.error('Quiz generation error:', err);
    next(err);
  }
};

// GET /api/quizzes/:lessonSlug  (existing)
exports.getQuizByLesson = async (req, res) => {
  const lesson = await Lesson.findOne({ slug: req.params.lessonSlug });
  if (!lesson) return res.status(404).json({ error: 'Lesson not found in Quiz query' });
  const quiz = await Quiz.findOne({ lessonId: lesson._id });
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  res.json(quiz);
};

// POST /api/quizzes/:lessonSlug/submit (existing)
exports.submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body;

    // Validate answers array
    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers must be an array' });
    }

    const lesson = await Lesson.findOne({ slug: req.params.lessonSlug });
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    const quiz = await Quiz.findOne({ lessonId: lesson._id });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    // Validate that answers match quiz length
    if (answers.length !== quiz.questions.length) {
      return res.status(400).json({
        error: `Expected ${quiz.questions.length} answers, got ${answers.length}`
      });
    }

    // Check if the user already mastered this quiz (we should block a retake)
    if (req.user.completedQuizzes.includes(quiz._id)) {
      return res.status(403).json({ error: 'You have already completed this quiz.' });
    }

    // Check all questions are answered
    if (answers.some(answer => answer === '' || answer === null || answer === undefined)) {
      return res.status(400).json({ error: 'All questions must be answered' });
    }

    let score = 0;
    const detailedAnswers = [];

    quiz.questions.forEach((q, i) => {
      // Robust comparison
      let isCorrect = false;
      const uAnswer = (answers[i] || '').trim().toLowerCase();
      let cAnswer = (q.correctAnswer || '').trim().toLowerCase();

      // Fallback for older quizzes that might have generated "opt1", "option 2", "b", etc.
      if (cAnswer.match(/^(opt|option)\s*[1-4]$/i)) {
        const idx = parseInt(cAnswer.replace(/[^1-4]/g, '')) - 1;
        if (q.options[idx]) cAnswer = q.options[idx].trim().toLowerCase();
      } else if (cAnswer.length === 1 && cAnswer.match(/^[a-d1-4]$/i)) {
        let idx = -1;
        if (cAnswer.match(/^[1-4]$/)) idx = parseInt(cAnswer) - 1;
        if (cAnswer === 'a') idx = 0;
        if (cAnswer === 'b') idx = 1;
        if (cAnswer === 'c') idx = 2;
        if (cAnswer === 'd') idx = 3;
        if (idx >= 0 && q.options[idx]) cAnswer = q.options[idx].trim().toLowerCase();
      }

      const qAnswer = cAnswer;

      if (uAnswer === qAnswer) {
        isCorrect = true;
        score++;
      }

      // Display the actual string option to the user on the frontend
      const finalCorrectAnswerString = q.options.find(
        opt => opt.trim().toLowerCase() === qAnswer
      ) || q.correctAnswer;

      detailedAnswers.push({
        question: q.question,
        userAnswer: answers[i],
        correctAnswer: finalCorrectAnswerString,
        isCorrect,
        explanation: q.explanation,
        options: q.options
      });
    });

    // Reward XP based on score (e.g. 5 XP per correct answer)
    const xpReward = score * 5;
    if (xpReward > 0) {
      req.user.xp += xpReward;
    }

    // Mark quiz as completed
    req.user.completedQuizzes.push(quiz._id);

    // Evaluate if any milestones were hit
    const newlyAwardedBadges = checkAndAwardBadges(req.user);

    await req.user.save();

    res.json({
      score,
      total: quiz.questions.length,
      xpRewarded: xpReward,
      totalXp: req.user.xp,
      badges: req.user.badges,
      newBadges: newlyAwardedBadges || [],
      answers: detailedAnswers
    });
  } catch (err) {
    console.error('Quiz submission error:', err);
    next(err);
  }
};
