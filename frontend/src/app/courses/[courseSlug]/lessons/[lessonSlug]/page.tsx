'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/app/store/store';
import { loginSuccess } from '@/app/store/authSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';

interface Lesson { _id: string; title: string; content: string; type: 'text' | 'video'; day: number; }

export default function LessonDetailPage() {
  const { courseSlug, lessonSlug } = useParams() as { courseSlug: string; lessonSlug: string };
  const { token, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const { data } = await axios.get(`/api/courses/${courseSlug}/${lessonSlug}`);
        setLesson(data);
      } catch (err) {
        console.error('Failed to fetch lesson:', err);
      } finally {
        setLoading(false);
      }
    };
    if (lessonSlug && courseSlug) fetchLesson();
    if (!token) router.push('/auth');
  }, [lessonSlug, courseSlug, token, router]);

  const handleMarkComplete = async () => {
    if (!token || !user || !lesson) return;
    setCompleting(true);
    try {
      const { data } = await axios.post('/api/users/complete-lesson', { lessonId: lesson._id }, { headers: { Authorization: `Bearer ${token}` } });
      const updatedUser = { ...user, xp: data.xp, completedLessons: data.completedLessons, badges: data.badges };
      dispatch(loginSuccess({ user: updatedUser, token }));
      toast.success('Module Mastered! +10 XP', { theme: 'dark' });
    } catch (err) {
      console.error(err);
      toast.error('System error marking complete');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) return <p className="p-10 text-center font-bold text-gray-500 tracking-widest uppercase">Decoupling Data...</p>;
  if (!lesson) return <p className="p-10 text-center text-red-500 font-bold uppercase tracking-widest">404: Module Offline</p>;

  const isCompleted = user?.completedLessons?.includes(lesson._id);

  return (
    <div className="max-w-5xl mx-auto p-6 py-10 space-y-8">
      <Link href={`/courses/${courseSlug}`} className="text-sm font-bold text-gray-400 hover:text-gray-800 inline-flex items-center transition bg-gray-50 px-4 py-2 rounded-full border">
        ← Back to Syllabus
      </Link>

      <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 space-y-6">
        <h1 className="text-4xl font-black text-gray-900 leading-tight">{lesson.title}</h1>
        <p className="text-blue-500 font-bold text-sm uppercase tracking-widest border-b border-gray-100 pb-6 inline-flex gap-4">
          <span className="bg-blue-50 px-3 py-1 rounded">Module {lesson.day}</span>
          <span className="bg-gray-50 text-gray-500 px-3 py-1 rounded border">{lesson.type}</span>
        </p>

        <div className="prose prose-lg max-w-none prose-blue py-6" dangerouslySetInnerHTML={{ __html: lesson.content }} />
      </div>

      {(user?.role === 'user' || user?.role === 'admin') && (
        <div className="bg-black border border-gray-800 p-8 rounded-3xl flex flex-col sm:flex-row gap-6 items-center justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full filter blur-[100px] opacity-20 pointer-events-none"></div>
          <div className="relative z-10">
            <h3 className="font-black text-white text-2xl mb-1">Knowledge Acquired?</h3>
            <p className="text-gray-400 text-sm font-medium tracking-wide">Mark this lesson as complete to earn XP and unlock the module quiz.</p>
          </div>

          <div className="flex gap-4 relative z-10">
            {!isCompleted ? (
              <button onClick={handleMarkComplete} disabled={completing} className="bg-blue-600 text-white px-8 py-4 rounded-xl font-black hover:bg-blue-500 transition-all shadow-lg active:scale-95 disabled:opacity-50">
                {completing ? 'Completing...' : 'Mark as Learned'}
              </button>
            ) : (
              <div className="flex gap-4 items-center">
                <span className="text-green-400 font-black flex items-center gap-2 uppercase tracking-widest text-sm bg-green-400/10 px-4 py-3 rounded-xl border border-green-400/20">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  Learned
                </span>
                <button onClick={() => router.push(`/courses/${courseSlug}/lessons/${lessonSlug}/quiz`)} className="bg-yellow-400 text-black px-8 py-4 rounded-xl font-black hover:bg-white transition-all shadow-lg active:scale-95">
                  Deploy AI Quiz →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" />
    </div>
  );
}
