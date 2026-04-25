'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '@clerk/nextjs';
import { RootState, AppDispatch } from '@/app/store/store';
import { loginSuccess } from '@/app/store/authSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Question {
  question: string;
  options: string[];
  explanation?: string;
}

interface Quiz {
  _id: string;
  lessonId: string;
  questions: Question[];
}

interface DetailedAnswer {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  options: string[];
}

interface QuizResult {
  score: number;
  total: number;
  xpRewarded: number;
  totalXp: number;
  answers: DetailedAnswer[];
}

export default function QuizPage() {
  const { courseSlug, lessonSlug } = useParams() as { courseSlug: string; lessonSlug: string };
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { getToken } = useAuth();

  // We need the lesson's MongoDB _id for quiz operations
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);

  const fetchQuiz = async (slug: string, clerkToken: string) => {
    try {
      const { data } = await axios.get<Quiz>(`/api/quizzes/${slug}`, {
        headers: { Authorization: `Bearer ${clerkToken}` }
      });
      setQuiz(data);
      setAnswers(new Array(data.questions.length).fill(''));
    } catch (err: any) {
      if (err.response?.status !== 404) {
        console.error('Error fetching quiz:', err);
      }
    }
  };

  useEffect(() => {
    if (!lessonSlug) return;

    const init = async () => {
      try {
        const clerkToken = await getToken();
        if (!clerkToken) {
          router.push('/auth');
          return;
        }
        // Fetch the lesson to get its MongoDB _id
        const { data: lesson } = await axios.get(`/api/courses/${courseSlug}/${lessonSlug}`);
        setLessonId(lesson._id);
        await fetchQuiz(lessonSlug, clerkToken);
      } catch (err) {
        console.error('Failed to load lesson:', err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [courseSlug, lessonSlug, getToken, router]);

  const handleGenerate = async () => {
    if (!lessonSlug) return;
    setGenerating(true);
    try {
      const clerkToken = await getToken();
      if (!clerkToken) {
        toast.error('Authentication failed');
        return;
      }
      const { data } = await axios.post(
        `/api/quizzes/generate/${lessonSlug}`,
        {},
        { headers: { Authorization: `Bearer ${clerkToken}` } }
      );
      // Sometimes APIs or interceptors unwrap the data object directly
      const fetchedQuiz = data?.quiz || data;
      
      if (!fetchedQuiz || !fetchedQuiz.questions) {
        throw new Error('Invalid quiz response from server: ' + JSON.stringify(data));
      }

      setQuiz(fetchedQuiz);
      setAnswers(new Array(fetchedQuiz.questions.length || 0).fill(''));
      toast.success('Quiz generated!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to generate quiz');
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectOption = (qIndex: number, option: string) => {
    const newAnswers = [...answers];
    newAnswers[qIndex] = option;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!lessonSlug) return;
    
    // Validate all answers are selected
    if (answers.includes('')) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    try {
      const clerkToken = await getToken();
      if (!clerkToken) {
        toast.error('Authentication failed');
        return;
      }
      const { data } = await axios.post(
        `/api/quizzes/${lessonSlug}/submit`,
        { answers },
        { headers: { Authorization: `Bearer ${clerkToken}` } }
      );
      setResult(data);
      if (user && data.totalXp) {
        dispatch(loginSuccess({ 
          user: { 
            ...user, 
            xp: data.totalXp,
            badges: data.badges || user.badges,
            completedQuizzes: [...(user.completedQuizzes || []), quiz?._id]
          }, 
          token: clerkToken 
        }));
      }
      toast.success('Quiz submitted successfully!');
      if (data.newBadges && data.newBadges.length > 0) {
        data.newBadges.forEach((badge: string) => {
          toast.info(`🏆 Badge Unlocked: ${badge}`, { theme: 'colored' });
        });
      }
    } catch (err: any) {
      console.error('Quiz submission error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to submit quiz';
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (quiz && !result && user?.completedQuizzes?.includes(quiz._id)) {
    return (
      <div className="max-w-2xl mx-auto p-6 mt-10 text-center bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-3xl font-black text-gray-800 mb-2">Quiz Already Mastered</h2>
        <p className="text-gray-500 mb-6 font-medium">You have already completed this assessment and claimed your XP.</p>
        <button
          onClick={() => router.push(`/courses/${courseSlug}`)}
          className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition shadow-lg"
        >
          Back to Course
        </button>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="max-w-2xl mx-auto p-6 mt-10 text-center bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="text-6xl mb-4">🧠</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No quiz yet for this lesson</h2>
        <p className="text-gray-500 mb-6">The AI hasn't generated one yet — click below to build it now.</p>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {generating ? 'Generating...' : 'Generate Quiz with AI'}
        </button>
        <ToastContainer position="bottom-center" />
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-10 animate-in fade-in zoom-in duration-500">
        {/* Score Summary */}
        <div className="bg-white p-12 rounded-2xl shadow-xl border-t-8 border-green-500 mb-8 text-center">
          <div className="flex justify-center mb-6">
            <svg className="w-24 h-24 text-green-500 animate-[bounce_1s_ease-in-out_infinite]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h1 className="text-4xl font-black text-gray-800 mb-2">Quiz Completed!</h1>
          <p className="text-xl text-gray-600 font-medium mb-8">
            You scored <span className="text-green-600 font-bold">{result.score}</span> out of <span className="font-bold">{result.total}</span>
          </p>
          
          {result.xpRewarded > 0 ? (
            <div className="inline-block bg-yellow-100 border border-yellow-200 text-yellow-800 px-6 py-3 rounded-xl font-bold animate-pulse text-lg">
              🎉 +{result.xpRewarded} XP Rewarded!
            </div>
          ) : (
            <div className="inline-block bg-gray-100 text-gray-600 px-6 py-3 rounded-xl font-medium">
              Better luck next time!
            </div>
          )}
        </div>

        {/* Detailed Answer Review */}
        <div className="space-y-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Answer Review</h2>
          {result.answers?.map((answer, i) => (
            <div
              key={i}
              className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${
                answer.isCorrect ? 'border-green-500' : 'border-red-500'
              }`}
            >
              {/* Question */}
              <div className="mb-4">
                <div className="flex items-start gap-3">
                  <span className="text-lg font-bold text-gray-500">{i + 1}.</span>
                  <h3 className="text-lg font-semibold text-gray-800">{answer.question}</h3>
                </div>
              </div>

              {/* Options with highlighting */}
              <div className="space-y-2 mb-4">
                {answer.options.map((option, j) => {
                  const isUserAnswer = option === answer.userAnswer;
                  const isCorrectAnswer = option === answer.correctAnswer;
                  
                  return (
                    <div
                      key={j}
                      className={`p-3 rounded-lg border-2 transition ${
                        isCorrectAnswer
                          ? 'border-green-500 bg-green-50'
                          : isUserAnswer && !isCorrectAnswer
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isCorrectAnswer && (
                          <span className="text-green-600 font-bold text-lg">✓</span>
                        )}
                        {isUserAnswer && !isCorrectAnswer && (
                          <span className="text-red-600 font-bold text-lg">✗</span>
                        )}
                        {!isCorrectAnswer && !isUserAnswer && (
                          <span className="text-gray-400">○</span>
                        )}
                        <span
                          className={`${
                            isCorrectAnswer
                              ? 'text-green-700 font-semibold'
                              : isUserAnswer && !isCorrectAnswer
                              ? 'text-red-700 font-semibold'
                              : 'text-gray-700'
                          }`}
                        >
                          {option}
                          {isCorrectAnswer && <span className="text-green-600 ml-2">(Correct)</span>}
                          {isUserAnswer && !isCorrectAnswer && <span className="text-red-600 ml-2">(Your Answer)</span>}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              {answer.explanation && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-900 mb-1">💡 Explanation:</p>
                  <p className="text-sm text-blue-800">{answer.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.push(`/courses/${courseSlug}`)}
            className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-8 py-3 rounded-lg font-medium transition"
          >
            Back to Lessons
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Lesson Assessment</h1>
        <span className="bg-blue-100 text-blue-800 px-4 py-1 rounded-full text-sm font-bold">
          {quiz.questions.length} Questions
        </span>
      </div>

      <div className="space-y-8">
        {quiz.questions.map((q, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in slide-in-from-bottom-4" style={{animationDelay: `${i * 100}ms`}}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              <span className="text-blue-500 mr-2">{i + 1}.</span> 
              {q.question}
            </h3>
            <div className="space-y-2">
              {q.options.map((opt, j) => (
                <label
                  key={j}
                  className={`block p-4 border rounded-lg cursor-pointer transition ${
                    answers[i] === opt 
                      ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name={`question-${i}`}
                      value={opt}
                      checked={answers[i] === opt}
                      onChange={() => handleSelectOption(i, opt)}
                      className="w-4 h-4 text-blue-600 hidden"
                    />
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${answers[i] === opt ? 'border-blue-500' : 'border-gray-300'}`}>
                      {answers[i] === opt && <div className="w-3 h-3 bg-blue-500 rounded-full" />}
                    </div>
                    <span className={`${answers[i] === opt ? 'font-medium text-blue-900' : 'text-gray-700'}`}>
                      {opt}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={answers.includes('')}
          className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          Submit Answers
        </button>
      </div>

      <ToastContainer position="bottom-right" />
    </div>
  );
}
