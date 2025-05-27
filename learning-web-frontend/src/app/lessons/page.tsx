'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import CourseCard from '../components/CourseCard';

const categories = [
  { key: 'all', label: 'All' },
  { key: 'frontend', label: 'Frontend' },
  { key: 'backend', label: 'Backend' },
  { key: 'fullstack', label: 'Full-Stack' },
];

export default function LessonsPage() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [activeCat, setActiveCat] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(false);

  const fetchLessons = async (skillPath: string) => {
    setLoading(true);
    try {
      const url =
        skillPath === 'all'
          ? '/api/lessons'
          : `/api/lessons?skillPath=${encodeURIComponent(skillPath)}`;
      const { data } = await axios.get(url);
      setLessons(data);
    } catch {
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons(activeCat);
  }, [activeCat]);

  return (
    <section className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <h1 className="text-4xl font-extrabold mb-6 text-gray-800">Lessons</h1>

      {/* Pill Tabs */}
      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCat(cat.key)}
            className={`px-4 py-1 rounded-full font-medium transition ${
              activeCat === cat.key
                ? 'bg-blue-600 text-white shadow'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center text-gray-500">Loading lessons…</div>
      ) : lessons.length === 0 ? (
        <div className="text-center text-gray-500">No lessons found.</div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <CourseCard
              key={lesson._id}
              id={lesson._id}
              title={lesson.title}
              excerpt={lesson.content.replace(/<[^>]+>/g, '')}
              day={lesson.day}
              type={lesson.type}
            />
          ))}
        </div>
      )}
    </section>
  );
}
