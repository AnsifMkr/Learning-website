'use client';

import { useEffect, useState, FormEvent } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import CourseCard from '../../../components/CourseCard';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const toolbarOptions = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike', 'code'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['link', 'image'],
  ['clean']
];

interface Lesson {
  _id: string;
  title: string;
  content: string;
  day: number;
  type: 'text' | 'video';
}

export default function SkillLessonsPage() {
  const { skillPath } = useParams() as { skillPath: string };
  const token = useSelector((s: RootState) => s.auth.token);
  const role = useSelector((s: RootState) => s.auth.user?.role);

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [day, setDay] = useState(1);
  const [type, setType] = useState<'text' | 'video'>('text');
  const [content, setContent] = useState('');

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get<Lesson[]>(
        `/api/lessons/path/${skillPath}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLessons(data);
    } catch (err) {
      console.error('Failed to fetch lessons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && skillPath) {
      fetchLessons();
    }
  }, [token, skillPath]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        `/api/lessons/path/${skillPath}`,
        { title, day, type, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle('');
      setDay(1);
      setType('text');
      setContent('');
      setIsEditing(false);
      fetchLessons();
    } catch (err) {
      console.error('Error adding lesson:', err);
      alert('Could not add lesson');
    }
  };

  return (
    <section className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold capitalize">{skillPath} Lessons</h1>
        {role === 'admin' && (
          <button
            onClick={() => setIsEditing(prev => !prev)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            {isEditing ? 'Cancel' : 'Add Content'}
          </button>
        )}
      </div>

      {isEditing && role === 'admin' && (
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-6 rounded-lg shadow">
          <input
            type="text"
            placeholder="Lesson Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />

          <div className="flex flex-wrap gap-4">
            <input
              type="number"
              min={1}
              placeholder="Day"
              value={day}
              onChange={e => setDay(+e.target.value)}
              className="w-24 p-2 border rounded"
              required
            />
            <select
              value={type}
              onChange={e => setType(e.target.value as 'text' | 'video')}
              className="p-2 border rounded"
            >
              <option value="text">Text</option>
              <option value="video">Video</option>
            </select>
          </div>

          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={{ toolbar: toolbarOptions }}
            placeholder="Write lesson content here..."
            className="h-72 bg-white mb-4"
          />

          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
          >
            Submit Lesson
          </button>
        </form>
      )}

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {lessons.map(lesson => (
          <CourseCard
            key={lesson._id}
            id={lesson._id}
            title={lesson.title}
            excerpt={
              typeof lesson.content === 'string'
                ? lesson.content.replace(/<[^>]+>/g, '').slice(0, 120) + '...'
                : ''
            }
            day={lesson.day}
            type={lesson.type}
          />
        ))}
      </div>
    </section>
  );
}
