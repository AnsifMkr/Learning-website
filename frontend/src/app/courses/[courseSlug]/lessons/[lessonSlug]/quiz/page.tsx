'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/app/store/store';
import { loginSuccess } from '@/app/store/authSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Question {
  question: string;
  options: string[];
}

interface Quiz {
  _id: string;
  lessonId: string;
  questions: Question[];
}

export default function QuizPage() {
  const { courseSlug, lessonSlug } = useParams() as { courseSlug: string; lessonSlug: string };
  const { token, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<{ score: number, total: number, xpRewarded: number, totalXp: number } | null>(null);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get<Quiz>(`/api/quizzes/${lessonSlug}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuiz(data);
      setAnswers(new Array(data.questions.length).fill(''));
    } catch (err: any) {
      if (err.response?.status !== 404) {
        console.error('Error fetching quiz:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && lessonSlug) {
      fetchQuiz();
    }
    if (!token) router.push('/auth');
  }, [lessonSlug, token, router]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data } = await axios.post(
        `/api/quizzes/generate/${lessonSlug}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuiz(data.quiz);
      setAnswers(new Array(data.quiz.questions.length).fill(''));
      toast.success('Quiz generated successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to generate quiz');
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
    try {
      const { data } = await axios.post(
        `/api/quizzes/${lessonSlug}/submit`,
        { answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(data);
      
      if (user && data.totalXp) {
        // Sync new XP directly!
        dispatch(loginSuccess({ user: { ...user, xp: data.totalXp }, token: token || '' }));
      }
      
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to submit quiz');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Quiz Not Found view
  if (!quiz) {
    return (
      <div className="max-w-2xl mx-auto p-6 mt-10 text-center bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="text-6xl mb-4">🧠</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz not ready yet!</h2>
        <p className="text-gray-500 mb-6">The AI is polishing up the assessment for this lesson. You can trigger it manually.</p>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {generating ? 'Generating with AI...' : 'Generate New Quiz'}
        </button>
        <ToastContainer position="bottom-center" />
      </div>
    );
  }

  // Result view with Animations
  if (result) {
    return (
      <div className="max-w-3xl mx-auto p-6 mt-10 text-center animate-in fade-in zoom-in duration-500">
        <div className="bg-white p-12 rounded-2xl shadow-xl border-t-8 border-green-500">
          <div className="flex justify-center mb-6">
            <svg className="w-24 h-24 text-green-500 animate-[bounce_1s_ease-in-out_infinite]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h1 className="text-4xl font-black text-gray-800 mb-2">Quiz Completed!</h1>
          <p className="text-xl text-gray-600 font-medium mb-8">
            You scored {result.score} out of {result.total}
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

          <div className="mt-10">
            <button
              onClick={() => router.push(`/courses/${courseSlug}`)}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-6 py-3 rounded-lg font-medium transition"
            >
              Back to Lessons
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Form view
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
