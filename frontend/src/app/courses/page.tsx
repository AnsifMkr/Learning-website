'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';

interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  thumbnail: string;
  level: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const { user } = useSelector((state: RootState) => state.auth);
  const { getToken } = useAuth();
  const [showModal, setShowModal] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [publishing, setPublishing] = useState(false);

  const fetchCourses = async () => {
    try {
      const { data } = await axios.get('/api/courses');
      setCourses(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishing(true);
    try {
      const freshToken = await getToken();
      let thumbnail = '';
      if (thumbnailFile) {
        const formData = new FormData();
        formData.append('thumbnail', thumbnailFile);
        const { data } = await axios.post('/api/courses/thumbnail', formData, {
          headers: { Authorization: `Bearer ${freshToken}` }
        });
        thumbnail = data.thumbnailUrl;
      }

      await axios.post('/api/courses', { title, description, category, level, thumbnail }, {
        headers: { Authorization: `Bearer ${freshToken}` }
      });
      setShowModal(false);
      fetchCourses();
      setTitle(''); setDescription(''); setCategory(''); setThumbnailFile(null);
    } catch (err: any) {
      console.error('Failed to create course:', err.response?.data || err.message);
      if (err.response?.status === 403) {
        alert("Server rejected the upload: Admin access required. Please ensure your Clerk session token includes the 'public_metadata' claim for your role.");
      } else if (err.response?.status === 401) {
        alert("Server rejected the upload: Unauthorized. Token may be missing or invalid.");
      } else {
        alert("Failed to create course. See console for details.");
      }
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b pb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-900">Learning Masterclasses</h1>
        {user?.role === 'admin' && (
          <button onClick={() => setShowModal(true)} className="w-full sm:w-auto bg-blue-600 text-white px-5 py-3 sm:py-2 rounded-xl shadow-md hover:bg-blue-700 font-bold tracking-wide transition">
            + New Masterclass
          </button>
        )}
      </div>

      <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {courses.map(c => (
          <Link href={`/courses/${c.slug}`} key={c._id}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full transform hover:-translate-y-1">
              <span className="text-[10px] uppercase px-3 py-1 bg-gray-100 text-gray-600 rounded-full font-extrabold w-max mb-4 tracking-widest">{c.category}</span>
              {c.thumbnail && (
                <div className="w-full h-32 mb-4 bg-gray-100 rounded-xl overflow-hidden">
                  <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                </div>
              )}
              <h2 className="text-2xl font-black mb-3 text-gray-800 leading-tight">{c.title}</h2>
              <p className="text-gray-500 mb-6 flex-1 text-sm leading-relaxed">{c.description}</p>
              <div className="font-bold text-sm text-blue-600 flex justify-between items-center mt-auto border-t border-gray-50 pt-4">
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg">{c.level}</span>
                <span className="flex items-center gap-1">Enter</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-blue-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black mb-6 text-gray-800 border-b border-gray-100 pb-4">Create a Course</h2>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">Upload Thumbnail</label>
                <input type="file" accept="image/*" onChange={e => setThumbnailFile(e.target.files?.[0] || null)} className="w-full text-sm block border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-100 file:text-blue-700 font-bold" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">Course Title</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full border-2 border-gray-200 focus:border-blue-500 p-3 rounded-xl outline-none font-medium bg-gray-50" placeholder="Advanced React Patterns..." />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">Course Description</label>
                <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full border-2 border-gray-200 focus:border-blue-500 p-3 rounded-xl outline-none text-sm bg-gray-50" rows={4} placeholder="What will students accomplish..."></textarea>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">Category</label>
                  <input required value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Artificial Intelligence" className="w-full border-2 border-gray-200 focus:border-blue-500 p-3 rounded-xl outline-none font-bold bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">Difficulty</label>
                  <select value={level} onChange={e => setLevel(e.target.value)} className="w-full border-2 border-gray-200 focus:border-blue-500 p-3 rounded-xl outline-none font-bold bg-gray-50">
                    <option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-6 border-t border-gray-100 mt-6">
                <button disabled={publishing} type="submit" className="flex-1 bg-black text-white py-4 rounded-xl font-black text-lg hover:bg-gray-800 disabled:opacity-50">{publishing ? 'Publishing...' : 'Publish'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="px-6 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
