'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '@clerk/nextjs';

import TiptapEditor from '../../components/TiptapEditor';

export default function CreateBlogPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [publishing, setPublishing] = useState(false);
  const { token, user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const { getToken } = useAuth();

  useEffect(() => {
    if (!token) {
      router.push('/auth');
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || content === '<p></p>') {
      toast.error('Please provide a title and write some content');
      return;
    }

    setPublishing(true);
    try {
      const freshToken = await getToken();
      if (!freshToken) {
        toast.error('Authentication error');
        setPublishing(false);
        return;
      }
      
      const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
      const { data } = await axios.post(
        '/api/blogs',
        { title, content, tags },
        { headers: { Authorization: `Bearer ${freshToken}` } }
      );
      toast.success('Published successfully!');
      router.push(`/blogs/${data._id}`);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to publish the blog');
      setPublishing(false);
    }
  };

  if (!token) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-3xl font-black text-gray-800 mb-2">Write an Article</h1>
        <p className="text-gray-500 mb-8">Share your learning journey or technical knowledge with the Community.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Article Title..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-4xl font-bold border-none outline-none placeholder-gray-300 bg-transparent"
              maxLength={100}
              required
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Tags (comma separated)... e.g., React, Node, WebDev"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              className="w-full text-lg font-medium text-gray-700 border-none outline-none placeholder-gray-400 bg-transparent border-b border-gray-100 pb-2 focus:border-blue-500 transition"
              maxLength={150}
            />
          </div>

          <div className="min-h-[400px]">
            <TiptapEditor
              content={content}
              onChange={setContent}
            />
          </div>

          <div className="pt-10 flex justify-between items-center border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-gray-500 hover:text-gray-800 font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={publishing}
              className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {publishing ? 'Publishing...' : 'Publish Article'}
            </button>
          </div>
        </form>
      </div>

      <ToastContainer position="bottom-right" />
    </div>
  );
}
