'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

interface Lesson {
  _id: string;
  title: string;
  content: string;
  type: 'text' | 'video';
  day: number;
}

export default function LessonDetailPage() {
  const { id } = useParams() as { id: string };
  const token = useSelector((state: RootState) => state.auth.token);

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const { data } = await axios.get(`/api/lessons/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLesson(data);
      } catch (err) {
        console.error('Failed to fetch lesson:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id && token) fetchLesson();
  }, [id, token]);

  if (loading) return <p className="p-6 text-center">Loading lesson…</p>;
  if (!lesson) return <p className="p-6 text-center text-red-500">Lesson not found</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
      <p className="text-gray-500 mb-4">Day {lesson.day} | {lesson.type.toUpperCase()}</p>
      
      <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: lesson.content }} />
    </div>
  );
}
