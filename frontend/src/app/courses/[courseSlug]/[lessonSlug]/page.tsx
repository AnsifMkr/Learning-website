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
import { useAuth } from '@clerk/nextjs';

interface Lesson { _id: string; title: string; content: string; type: 'text' | 'video'; day: number; }

export default function LessonDetailPage() {
  const { courseSlug, lessonSlug } = useParams() as { courseSlug: string; lessonSlug: string };
  const { token, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const { getToken } = useAuth();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!token) { router.push('/auth'); return; }
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
    if (lessonSlug) fetchLesson();
  }, [courseSlug, lessonSlug, token, router]);

  const handleMarkComplete = async () => {
    if (!user || !lesson) return;
    setCompleting(true);
    try {
      const freshToken = await getToken();
      if (!freshToken) throw new Error("No authentication token available");
      
      const { data } = await axios.post(
        '/api/users/complete-lesson',
        { lessonId: lesson._id },
        { headers: { Authorization: `Bearer ${freshToken}` } }
      );
      // Always compare as strings — completedLessons can come back as ObjectIds
      const updatedUser = {
        ...user,
        xp: data.xp,
        completedLessons: data.completedLessons.map(String),
        badges: data.badges,
        yearlyActivity: data.yearlyActivity,
        currentYearStreak: data.currentYearStreak,
        longestStreak: data.longestStreak,
      };
      dispatch(loginSuccess({ user: updatedUser, token: freshToken }));
      toast.success('Lesson done! +10 XP 🎉', { theme: 'dark' });
      if (data.newBadges && data.newBadges.length > 0) {
        data.newBadges.forEach((badge: string) => {
          toast.info(`🏆 Badge Unlocked: ${badge}`, { theme: 'colored' });
        });
      }
    } catch (err: any) {
      console.error('complete-lesson error:', err);
      toast.error(err?.response?.data?.error || 'Failed to mark complete. Check your connection.', { theme: 'dark' });
    } finally {
      setCompleting(false);
    }
  };

  if (loading) return <p className="p-10 text-center font-bold text-gray-500 tracking-widest uppercase">Loading lesson...</p>;
  if (!lesson) return <p className="p-10 text-center text-red-500 font-bold uppercase tracking-widest">404: Lesson not found</p>;

  // Force string comparison — ObjectId vs string mismatch breaks Array.includes
  const completedIds = (user?.completedLessons ?? []).map(String);
  const isCompleted = completedIds.includes(String(lesson._id));

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
        <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-xl">
          {/* Status bar at top */}
          <div className={`h-1.5 w-full transition-all duration-700 ${isCompleted ? 'bg-green-400' : 'bg-gray-200'}`} />

          <div className="bg-white p-6 sm:p-8 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* Left: status info */}
            <div className="flex items-start sm:items-center gap-4 w-full">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors duration-500 ${isCompleted ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50 border-2 border-gray-200'}`}>
                {isCompleted ? (
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                )}
              </div>
              <div>
                <p className={`font-bold text-lg leading-tight ${isCompleted ? 'text-green-700' : 'text-gray-800'}`}>
                  {isCompleted ? 'Lesson complete' : 'Done reading?'}
                </p>
                <p className="text-gray-400 text-sm mt-0.5">
                  {isCompleted
                    ? 'Your XP has been credited. Take the quiz to earn more.'
                    : 'Mark it complete to save your progress and earn +10 XP.'}
                </p>
              </div>
            </div>

            {/* Right: action buttons */}
            <div className="flex gap-3 flex-shrink-0 w-full lg:w-auto">
              {!isCompleted ? (
                <button
                  onClick={handleMarkComplete}
                  disabled={completing}
                  className="w-full lg:w-auto justify-center flex items-center gap-2 bg-gray-900 text-white px-7 py-3.5 rounded-xl font-bold hover:bg-gray-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {completing ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Mark as Complete
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => router.push(`/courses/${courseSlug}/${lessonSlug}/quiz`)}
                  className="w-full lg:w-auto justify-center flex items-center gap-2 bg-yellow-400 text-gray-900 px-7 py-3.5 rounded-xl font-bold hover:bg-yellow-300 transition-all active:scale-95 shadow-sm"
                >
                  <span>Take the Quiz</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
}
