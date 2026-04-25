'use client';

import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  thumbnail: string;
  level: string;
}

export default function Home() {
  const token = useSelector((state: RootState) => state.auth.token);
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await axios.get('/api/courses');
        setCourses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleGetStarted = () => {
    if (token) {
      router.push('/courses');
    } else {
      router.push('/auth');
    }
  };

  return (
    <main className="space-y-20 pb-20">
      <section className="bg-blue-900 text-white text-center py-24 px-4 overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 flex space-x-10 -rotate-12 pointer-events-none scale-150">
           <div className="h-full w-32 bg-blue-400"></div>
           <div className="h-full w-32 bg-purple-500"></div>
           <div className="h-full w-32 bg-green-400"></div>
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-6xl font-black mb-6 tracking-tight">Unlock Your Mastery.</h1>
          <p className="text-2xl text-blue-100 mb-10 font-light leading-relaxed">
            Propel your career forward with structured masterclasses, intelligent assessments, and production-grade concepts.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-yellow-400 text-black px-10 py-5 rounded-full text-xl font-black hover:bg-yellow-300 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-yellow-400/20"
          >
            Start Learning Now
          </button>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-gray-900 mb-4">Discover Your Next Skill</h2>
          <p className="text-gray-500 text-lg">Curated masterclasses taught by experts</p>
        </div>
        
        {loading ? (
          <div className="flex justify-center text-gray-400 tracking-widest font-bold uppercase"><div className="animate-pulse">Loading Catalog...</div></div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((path) => (
              <Link
                key={path._id}
                href={`/courses/${path.slug}`}
                className="group bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-2xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-2 overflow-hidden relative"
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-purple-500"></div>
                {path.thumbnail ? (
                  <div className="h-48 w-full rounded-2xl bg-gray-100 mb-6 overflow-hidden">
                    <img src={path.thumbnail} alt={path.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                ) : (
                  <div className="h-48 w-full rounded-2xl bg-gray-50 flex items-center justify-center mb-6">
                    <div className="text-6xl group-hover:scale-125 transition-transform">📚</div>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-lg">{path.level}</span>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3 leading-tight">{path.title}</h3>
                <p className="text-gray-500 leading-relaxed font-medium flex-1">{path.description}</p>
                <div className="mt-8 pt-4 border-t border-gray-50 flex justify-between items-center text-blue-600 font-bold group-hover:text-blue-800">
                  <span>Enter Masterclass</span>
                  <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </div>
              </Link>
            ))}
            {courses.length === 0 && (
              <div className="col-span-full py-16 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl">
                The database is currently empty. Add a course as an Admin!
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
