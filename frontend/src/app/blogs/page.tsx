'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface Blog {
  _id: string;
  title: string;
  content: string;
  tags?: string[];
  views?: number;
  likes?: string[];
  author: {
    _id: string;
    name: string;
    username: string;
    avatarUrl?: string;
  };
  createdAt: string;
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data } = await axios.get('/api/blogs');
        setBlogs(data);
      } catch (err) {
        console.error('Failed to fetch blogs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-8 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-4xl font-black mb-2">Community Voices</h1>
          <p className="text-blue-200">Read what fellow learners are sharing, or post your own knowledge.</p>
        </div>
        {token && (
          <Link
            href="/blogs/create"
            className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-full font-bold shadow-lg hover:bg-yellow-300 hover:-translate-y-1 transition transform"
          >
            + Write a Blog
          </Link>
        )}
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 text-lg">No blogs published yet. Be the first!</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog, idx) => (
            <div 
              key={blog._id} 
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition duration-300 border border-gray-100 overflow-hidden flex flex-col group animate-in slide-in-from-bottom-8"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="p-6 flex-1 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                    {blog.author?.avatarUrl ? (
                      <img src={blog.author.avatarUrl} alt={blog.author.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-gray-500 bg-gray-100">
                        {blog.author?.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{blog.author?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <Link href={`/blogs/${blog._id}`} className="block group-hover:text-blue-600 transition">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{blog.title}</h2>
                  <div 
                    className="text-gray-600 text-sm line-clamp-3 prose prose-sm max-w-none prose-p:m-0"
                    dangerouslySetInnerHTML={{ __html: blog.content.substring(0, 150) + '...' }}
                  />
                </Link>
                {blog.tags && blog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-2 border-t border-gray-50">
                    {blog.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-bold border border-blue-100">
                        #{tag}
                      </span>
                    ))}
                    {blog.tags.length > 3 && (
                      <span className="text-gray-400 text-xs py-1 font-medium">+{blog.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
                <div className="flex items-center gap-4 text-gray-500 text-sm font-medium">
                  <span className="flex items-center gap-1.5 font-mono">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
                    {blog.likes?.length || 0}
                  </span>
                  <span className="flex items-center gap-1.5 font-mono">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    {blog.views || 0}
                  </span>
                </div>
                <Link href={`/blogs/${blog._id}`} className="text-blue-600 text-sm font-bold hover:underline">
                  Read Full Article →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
