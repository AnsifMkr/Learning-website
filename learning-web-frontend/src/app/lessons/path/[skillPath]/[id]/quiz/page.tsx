'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../store/store';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default function QuizPage() {
  const { skillPath, id } = useParams();
  const token = useSelector((s: RootState) => s.auth.token);

  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);

  // Fetch (or generate) quiz
  useEffect(() => {
    axios.get(`/api/quizzes/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setQuiz(res.data);
      setAnswers(Array(res.data.questions.length).fill(''));
    })
    .catch(() => {
      // No quiz yet → generate automatically
      axios.post(`/api/quizzes/generate/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => axios.get(`/api/quizzes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }))
      .then(res => {
        setQuiz(res.data);
        setAnswers(Array(res.data.questions.length).fill(''));
      });
    });
  }, [id, token]);

  const submit = async () => {
    const { data } = await axios.post(
      `/api/quizzes/${id}/submit`,
      { answers },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setResult(data);
  };

  if (!quiz) return <p>Loading quiz…</p>;

  if (result) {
    return (
      <div className="max-w-sm mx-auto p-6 text-center space-y-4">
        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto animate-ping" />
        <div className="bg-green-600 text-white p-4 rounded-lg">
          You scored {result.score} / {result.total}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Quiz Time!</h2>
      {quiz.questions.map((q: any, i: number) => (
        <div key={i} className="mb-4">
          <p className="font-medium">{q.question}</p>
          {q.options.map((opt: string) => (
            <label key={opt} className="flex items-center space-x-2">
              <input
                type="radio"
                name={`q${i}`}
                value={opt}
                checked={answers[i] === opt}
                onChange={() =>
                  setAnswers(a => {
                    const nxt = [...a];
                    nxt[i] = opt;
                    return nxt;
                  })
                }
                className="form-radio"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      ))}
      <button
        onClick={submit}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
      >
        Submit Quiz
      </button>
    </div>
  );
}
