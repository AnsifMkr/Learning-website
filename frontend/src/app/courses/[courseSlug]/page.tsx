'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import TiptapEditor from '../../components/TiptapEditor';

interface Course { _id: string; title: string; slug: string; description: string; level: string; thumbnail: string; category?: string; }
interface Lesson { _id: string; title: string; slug: string; type: string; day: number; content?: string;}

export default function CourseSyllabusPage() {
  const { courseSlug } = useParams() as { courseSlug: string };
  const router = useRouter();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const { user } = useSelector((state: RootState) => state.auth);
  const { getToken } = useAuth();
  
  // Lesson Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('text');
  const [day, setDay] = useState(1);
  const [publishing, setPublishing] = useState(false);

  // Edit Course Modal State
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState({ title: '', description: '', level: '', category: '' });
  const [savingCourse, setSavingCourse] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await axios.get(`/api/courses/info/${courseSlug}`);
        setCourse(courseRes.data);
        
        const lessonsRes = await axios.get(`/api/courses/${courseSlug}/lessons`);
        setLessons(lessonsRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (courseSlug) fetchData();
  }, [courseSlug]);

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCourse(true);
    try {
      const freshToken = await getToken();
      await axios.put(`/api/courses/info/${courseSlug}`, courseForm, {
        headers: { Authorization: `Bearer ${freshToken}` }
      });
      setShowCourseModal(false);
      const courseRes = await axios.get(`/api/courses/info/${courseSlug}`);
      setCourse(courseRes.data);
    } catch (err) {
      console.error(err);
      alert('Failed to update course.');
    } finally {
      setSavingCourse(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!confirm('Are you sure you want to delete this entire course and all its modules? This action is irreversible.')) return;
    try {
      const freshToken = await getToken();
      await axios.delete(`/api/courses/info/${courseSlug}`, {
        headers: { Authorization: `Bearer ${freshToken}` }
      });
      router.push('/courses');
    } catch (err) {
      console.error(err);
      alert('Failed to delete course.');
    }
  };

  const openEditCourse = () => {
    if (course) {
      setCourseForm({
        title: course.title,
        description: course.description,
        level: course.level || '',
        category: course.category || '',
      });
      setShowCourseModal(true);
    }
  };

  const resetLessonForm = () => {
    setEditingLesson(null);
    setTitle('');
    setContent('');
    setType('text');
    setDay(lessons.length > 0 ? Math.max(...lessons.map(l => l.day)) + 1 : 1);
  };

  const handleOpenCreateModal = () => {
    resetLessonForm();
    setShowModal(true);
  };

  const handleOpenEditLessonModal = async (lessonSlug: string) => {
    try {
      const { data } = await axios.get(`/api/courses/${courseSlug}/${lessonSlug}`);
      setEditingLesson(data);
      setTitle(data.title);
      setContent(data.content || '');
      setType(data.type);
      setDay(data.day);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch module details.');
    }
  };

  const handleDeleteLesson = async (lessonSlug: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!confirm('Are you sure you want to delete this module?')) return;
    try {
      const freshToken = await getToken();
      await axios.delete(`/api/courses/${courseSlug}/${lessonSlug}`, {
        headers: { Authorization: `Bearer ${freshToken}` }
      });
      const { data } = await axios.get(`/api/courses/${courseSlug}/lessons`);
      setLessons(data);
    } catch (err) {
      console.error(err);
      alert('Failed to delete module.');
    }
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishing(true);
    try {
      if (!course) return;
      const freshToken = await getToken();
      const payload = { title, content, type, day, courseId: course._id };
      
      if (editingLesson) {
        await axios.put(`/api/courses/${courseSlug}/${editingLesson.slug}`, payload, {
          headers: { Authorization: `Bearer ${freshToken}` }
        });
      } else {
        await axios.post(`/api/courses/${courseSlug}/lessons`, payload, {
          headers: { Authorization: `Bearer ${freshToken}` }
        });
      }
      
      setShowModal(false);
      const { data } = await axios.get(`/api/courses/${courseSlug}/lessons`);
      setLessons(data);
      resetLessonForm();
    } catch (err: any) {
      console.error('Failed to save lesson:', err.response?.data || err.message);
      if (err.response?.status === 403) {
        alert("Server rejected the save: Admin access required.");
      } else if (err.response?.status === 401) {
        alert("Server rejected the save: Unauthorized. Token may be missing or invalid.");
      } else {
        alert("Failed to save syllabus module. See console for details.");
      }
    } finally {
      setPublishing(false);
    }
  };

  if (!course) return <p className="p-10 text-center text-gray-500 tracking-widest font-bold">Synchronizing Syllabus...</p>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link href="/courses" className="text-sm font-bold text-gray-400 hover:text-gray-800 mb-6 inline-flex items-center transition bg-gray-50 px-4 py-2 border rounded-full">
        ← Back to Catalog
      </Link>
      
      <div className="flex flex-col xl:flex-row xl:items-start gap-4 mb-12 relative overflow-hidden">
        <div className="bg-black text-white rounded-[2rem] shadow-2xl flex flex-col md:flex-row overflow-hidden flex-1 relative min-h-[300px]">
          {course.thumbnail && (
            <div className="w-full h-48 md:w-5/12 md:h-auto bg-gray-100">
              <img src={course.thumbnail} alt="" className="w-full h-full object-cover opacity-70 md:border-r border-gray-800" />
            </div>
          )}
          <div className="p-10 relative z-10 flex-1 flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full filter blur-[100px] opacity-30 mix-blend-screen translate-x-1/3 -translate-y-1/3"></div>
            <div className="mb-6">
              <span className="bg-white/10 border border-white/20 text-blue-200 text-xs font-black px-4 py-2 rounded-full inline-block uppercase tracking-widest backdrop-blur-md">{course.level}</span>
              {course.category && <span className="ml-2 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-black px-4 py-2 rounded-full inline-block uppercase tracking-widest backdrop-blur-md">{course.category}</span>}
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">{course.title}</h1>
            <p className="text-gray-300 text-lg leading-relaxed">{course.description}</p>
          </div>
        </div>

        {user?.role === 'admin' && (
          <div className="flex flex-col sm:flex-row xl:flex-col gap-3 shrink-0 xl:w-48 bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 self-stretch justify-center">
            <h3 className="text-xs uppercase tracking-widest font-black text-gray-400 text-center mb-0 sm:mb-2 hidden sm:block">Course Management</h3>
            <button onClick={openEditCourse} className="flex-1 xl:flex-none justify-center flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-3 rounded-xl font-black hover:bg-blue-600 hover:text-white transition group border border-blue-100 hover:border-blue-600 shadow-sm">
              <span className="text-lg opacity-70 group-hover:opacity-100">✏️</span> Edit Course
            </button>
            <button onClick={handleDeleteCourse} className="flex-1 xl:flex-none justify-center flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl font-black hover:bg-red-600 hover:text-white transition group border border-red-100 hover:border-red-600 shadow-sm">
              <span className="text-lg opacity-70 group-hover:opacity-100">🗑️</span> Delete Course
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-between items-end border-b-2 border-gray-100 pb-6 mb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Syllabus</h2>
          <p className="text-gray-500 font-medium mt-1">{lessons.length} core modules built</p>
        </div>
        {user?.role === 'admin' && (
          <button onClick={handleOpenCreateModal} className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg shadow-green-500/30 hover:bg-green-600 font-black tracking-wide transition transform hover:-translate-y-1">
            + Add Module
          </button>
        )}
      </div>

      <div className="space-y-4 relative">
        <div className="absolute left-8 top-8 bottom-8 w-1 bg-blue-50 rounded-full -z-10"></div>
        {lessons.length === 0 && <p className="text-center text-gray-400 font-bold py-10 border-2 border-dashed border-gray-100 rounded-3xl">No modules found.</p>}
        {lessons.map((lesson) => (
          <div key={lesson._id} className="relative group">
            <Link href={`/courses/${course.slug}/${lesson.slug}`} className="block">
              <div className="p-4 border-2 border-transparent hover:border-blue-100 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center group/card cursor-pointer bg-gray-50/50 backdrop-blur-sm -ml-2 sm:pr-[140px] pr-4 gap-4 sm:gap-0">
                <div className="flex items-center w-full sm:w-auto">
                  <div className="h-16 w-16 rounded-2xl bg-white border-2 border-blue-100 text-blue-600 flex items-center justify-center font-black text-2xl mr-4 sm:mr-6 shrink-0 shadow-sm group-hover/card:scale-110 transition-transform duration-300">
                    {lesson.day}
                  </div>
                  <div className="flex-1 overflow-hidden sm:hidden">
                    <h3 className="font-bold text-lg text-gray-800 truncate">{lesson.title}</h3>
                  </div>
                </div>
                <div className="hidden sm:block flex-1 overflow-hidden">
                  <h3 className="font-bold text-xl text-gray-800 group-hover/card:text-blue-700 transition truncate">{lesson.title}</h3>
                </div>
                <div className="hidden sm:flex shrink-0 w-12 h-12 rounded-full bg-blue-50 text-blue-400 items-center justify-center group-hover/card:bg-blue-600 group-hover/card:text-white transition-colors">
                  <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M9 5l7 7-7 7"></path></svg>
                </div>
              </div>
            </Link>

            {user?.role === 'admin' && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleOpenEditLessonModal(lesson.slug); }}
                  className="p-3 bg-white rounded-xl shadow-md border border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition transform hover:scale-110"
                  title="Edit Module"
                >
                  ✏️
                </button>
                <button 
                  onClick={(e) => handleDeleteLesson(lesson.slug, e)}
                  className="p-3 bg-white rounded-xl shadow-md border border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50 transition transform hover:scale-110"
                  title="Delete Module"
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-4xl shadow-2xl max-h-[95vh] overflow-y-auto border border-gray-200 flex flex-col">
            <h2 className="text-3xl font-black mb-6 text-gray-900 border-b border-gray-100 pb-4 shrink-0">
              {editingLesson ? 'Edit Module' : 'Create a Module'}
            </h2>
            <form onSubmit={handleSaveLesson} className="flex-1 flex flex-col space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 shrink-0">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-black text-gray-500 mb-2">Module Title</label>
                  <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full border-2 border-gray-200 focus:border-blue-500 p-4 rounded-xl outline-none font-bold bg-gray-50 shadow-inner" placeholder="DOM Manipulation basics..." />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-black text-gray-500 mb-2">Day Number</label>
                  <input type="number" required value={day} onChange={e => setDay(Number(e.target.value))} className="w-full border-2 border-gray-200 focus:border-blue-500 p-4 rounded-xl outline-none font-bold bg-gray-50 shadow-inner" />
                </div>
              </div>
              
              <div className="shrink-0">
                <label className="block text-xs uppercase tracking-widest font-black text-gray-500 mb-2">Content Type</label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className={`flex-1 border-2 p-4 rounded-xl cursor-pointer font-bold flex items-center justify-center gap-2 transition ${type === 'text' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}>
                    <input type="radio" className="hidden" name="type" value="text" checked={type === 'text'} onChange={() => setType('text')} />
                    <span>📝 Rich HTML / Markdown</span>
                  </label>
                  <label className={`flex-1 border-2 p-4 rounded-xl cursor-pointer font-bold flex items-center justify-center gap-2 transition ${type === 'video' ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-md' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}>
                    <input type="radio" className="hidden" name="type" value="video" checked={type === 'video'} onChange={() => setType('video')} />
                    <span>🎥 Video Wrapper</span>
                  </label>
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                <label className="block text-xs uppercase tracking-widest font-black text-gray-500 mb-2">Module Content</label>
                {type === 'text' ? (
                  <div className="flex-1 overflow-y-auto mb-2 border-2 border-gray-200 rounded-xl bg-white group focus-within:border-blue-500 transition-colors">
                    <TiptapEditor
                      content={content}
                      onChange={setContent}
                      className="min-h-[300px] border-none shadow-none rounded-none"
                    />
                  </div>
                ) : (
                  <textarea required value={content} onChange={e => setContent(e.target.value)} className="flex-1 w-full border-2 border-gray-200 focus:border-blue-500 p-4 rounded-xl outline-none font-mono text-sm bg-gray-900 text-green-400 shadow-inner leading-relaxed min-h-[300px]" placeholder="<iframe width='560' height='315' src='https://www.youtube.com/embed/...' />"></textarea>
                )}
              </div>
              
              <div className="flex gap-4 pt-4 border-t border-gray-100 shrink-0">
                <button disabled={publishing} type="submit" className="flex-1 bg-green-500 text-white py-4 rounded-xl font-black text-lg hover:bg-green-600 transition shadow-lg shadow-green-500/40 disabled:opacity-50">
                  {publishing ? 'Saving...' : (editingLesson ? 'Update Module' : 'Save Module')}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-8 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCourseModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl border border-gray-200 flex flex-col mt-4">
            <h2 className="text-3xl font-black mb-6 text-gray-900 border-b border-gray-100 pb-4">Edit Course Details</h2>
            <form onSubmit={handleSaveCourse} className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-widest font-black text-gray-500 mb-2">Course Title</label>
                <input required value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} className="w-full border-2 border-gray-200 focus:border-blue-500 p-4 rounded-xl outline-none font-bold bg-gray-50" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest font-black text-gray-500 mb-2">Course Description</label>
                <textarea required value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} className="w-full border-2 border-gray-200 focus:border-blue-500 p-4 rounded-xl outline-none bg-gray-50 min-h-[140px] leading-relaxed" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-black text-gray-500 mb-2">Difficulty Level</label>
                  <input required value={courseForm.level} onChange={e => setCourseForm({...courseForm, level: e.target.value})} className="w-full border-2 border-gray-200 focus:border-blue-500 p-4 rounded-xl outline-none bg-gray-50 font-bold" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-black text-gray-500 mb-2">Category</label>
                  <input value={courseForm.category} onChange={e => setCourseForm({...courseForm, category: e.target.value})} className="w-full border-2 border-gray-200 focus:border-purple-500 p-4 rounded-xl outline-none bg-gray-50 font-bold text-purple-700" />
                </div>
              </div>
              <div className="flex gap-4 pt-6 mt-6 border-t border-gray-100">
                <button disabled={savingCourse} type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-black text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-500/40 disabled:opacity-50">{savingCourse ? 'Saving...' : 'Save Changes'}</button>
                <button type="button" onClick={() => setShowCourseModal(false)} className="px-8 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
