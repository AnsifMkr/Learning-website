'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface Lesson {
  _id: string;
  title: string;
  content: string;
  day: number;
  type: 'text' | 'video';
}

export default function LessonDetailPage() {
  const { skillPath, id } = useParams(); // e.g. 'frontend', 'backend', etc.
  const router = useRouter();
  const token = useSelector((s: RootState) => s.auth.token);
  const role = useSelector((s: RootState) => s.auth.user?.role);

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quizResult, setQuizResult] = useState<{ score: number; total: number } | null>(null);
  const [loadingLesson, setLoadingLesson] = useState(true);

  // Fetch lesson details
  useEffect(() => {
    setLoadingLesson(true);
    axios
      .get<Lesson>(`/api/lessons/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setLesson(res.data))
      .catch(console.error)
      .finally(() => setLoadingLesson(false));
  }, [id, token]);

  // Admin: generate quiz via AI
  const generateQuiz = async () => {
    try {
      await axios.post(
        `/api/quizzes/generate/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push(`/lessons/path/${skillPath}/${id}/quiz`);
    } catch (err) {
      console.error('Quiz generation failed', err);
      alert('Failed to generate quiz');
    }
  };

  // User: mark finished and go to quiz
  const handleFinished = () => {
    router.push(`/lessons/path/${skillPath}/${id}/quiz`);
  };

  if (loadingLesson) {
    return <p className="p-6 text-center">Loading lesson…</p>;
  }

  if (!lesson) {
    return <p className="p-6 text-center text-red-600">Lesson not found.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Lesson Title */}
      <h1 className="text-3xl font-bold">{lesson.title}</h1>
      <p className="text-gray-500">
        Day {lesson.day} • {lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)}
      </p>

      {/* Lesson Content */}
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: lesson.content }}
      />

      <div className="flex space-x-4">
        {/* User and Admin: Finished / Take Quiz */}
        <button
          onClick={handleFinished}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Mark as Finished & Take Quiz
        </button>

        {/* Admin: Generate Quiz Button */}
        {role === 'admin' && (
          <button
            onClick={generateQuiz}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            Generate Quiz
          </button>
        )}
      </div>
    </div>
  );
}
