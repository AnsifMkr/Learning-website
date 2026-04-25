'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '@clerk/nextjs';

interface Comment {
  _id: string;
  user: {
    _id: string;
    name: string;
    username: string;
    avatarUrl?: string;
  };
  content: string;
  createdAt: string;
}

interface Blog {
  _id: string;
  title: string;
  content: string;
  tags?: string[];
  views?: number;
  likes?: string[];
  comments?: Comment[];
  author: {
    _id: string;
    name: string;
    username: string;
    avatarUrl?: string;
  };
  createdAt: string;
}

export default function BlogDetailPage() {
  const { id } = useParams() as { id: string };
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const { getToken } = useAuth();
  const viewBumped = useRef(false);

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (!user) return toast.error('You must be logged in to like');
    setIsLiking(true);
    try {
      const freshToken = await getToken();
      if (!freshToken) return toast.error('Authentication error');
      const { data } = await axios.post(`/api/blogs/${id}/like`, {}, {
        headers: { Authorization: `Bearer ${freshToken}` }
      });
      setBlog((prev) => prev ? { ...prev, likes: data.likes } : null);
    } catch (err) {
      toast.error('Failed to toggle like');
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const freshToken = await getToken();
      if (!freshToken) return toast.error('Authentication error');
      const { data } = await axios.post(`/api/blogs/${id}/comments`, { content: commentText }, {
        headers: { Authorization: `Bearer ${freshToken}` }
      });
      setBlog((prev) => prev ? { ...prev, comments: data.comments } : null);
      setCommentText('');
      toast.success('Comment added!');
    } catch (err) {
      toast.error('Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;
    try {
      const freshToken = await getToken();
      if (!freshToken) return toast.error('Authentication error');
      const { data } = await axios.delete(`/api/blogs/${id}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${freshToken}` }
      });
      setBlog((prev) => prev ? { ...prev, comments: data.comments } : null);
      toast.success('Comment deleted!');
    } catch (err) {
      toast.error('Failed to delete comment');
    }
  };

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { data } = await axios.get(`/api/blogs/${id}`);
        setBlog(data);
        // Fire-and-forget: bump the view count once per page load
        if (!viewBumped.current) {
          viewBumped.current = true;
          const freshToken = await getToken();
          // Only authenticated users can bump the view count now
          if (freshToken) {
            axios.post(`/api/blogs/${id}/view`, {}, {
              headers: { Authorization: `Bearer ${freshToken}` }
            }).catch(() => {});
          }
        }
      } catch (err) {
        console.error('Failed to fetch blog:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBlog();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your article?')) return;
    try {
      const freshToken = await getToken();
      if (!freshToken) return toast.error('Authentication error');
      await axios.delete(`/api/blogs/${id}`, {
        headers: { Authorization: `Bearer ${freshToken}` }
      });
      toast.success('Blog deleted successfully');
      router.push('/blogs');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to delete blog');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!blog) return <div className="p-10 text-center text-red-500 font-bold text-xl">Blog not found.</div>;

  const isAuthor = user?._id === blog.author?._id;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 animate-in fade-in duration-700">
      <Link href="/blogs" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4">
        ← Back to Community
      </Link>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 md:p-12">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b pb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow-sm">
                {blog.author?.avatarUrl ? (
                  <img src={blog.author.avatarUrl} alt={blog.author.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-gray-500 bg-gray-100 text-xl">
                    {blog.author?.name?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{blog.author?.name}</p>
                <p className="text-sm font-mono text-gray-500">@{blog.author?.username || 'user'}</p>
              </div>
            </div>
            
            <div className="text-left md:text-right">
              <p className="text-sm text-gray-500">Published on</p>
              <p className="font-medium text-gray-800">
                {new Date(blog.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
            {blog.title}
          </h1>

          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {blog.tags.map((tag, i) => (
                <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm font-bold border border-blue-100">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-6 mb-8 pb-8 border-b text-gray-500 font-medium">
            <button 
              onClick={handleLike} 
              disabled={isLiking}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${blog.likes?.includes(user?._id || '') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-50 hover:bg-gray-100 border border-gray-100'}`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill={blog.likes?.includes(user?._id || '') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              {blog.likes?.length || 0} Likes
            </button>
            <div className="flex items-center gap-2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              {blog.views || 0} Views
            </div>
          </div>

          <div 
            className="prose prose-lg prose-blue max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>

        {(isAuthor || isAdmin) && (
          <div className="bg-gray-50 p-6 border-t flex justify-end">
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-800 font-bold px-4 py-2 rounded transition"
            >
              Delete Article
            </button>
          </div>
        )}
      </div>

      {/* Discussion Board */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b pb-4">
          Discussion ({blog.comments?.length || 0})
        </h2>

        {user ? (
          <form onSubmit={handleAddComment} className="mb-10 flex flex-col items-end">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="What are your thoughts?"
              className="w-full border border-gray-200 rounded-xl p-4 min-h-[120px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none mb-4 bg-gray-50 hover:bg-white"
              required
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-blue-700 transition disabled:opacity-50"
            >
              Post Comment
            </button>
          </form>
        ) : (
          <div className="bg-gray-50 text-center py-6 rounded-xl border border-gray-200 text-gray-500 mb-10 shadow-inner">
            <Link href="/auth" className="text-blue-600 font-black hover:underline mr-1">Log in</Link> 
            to join the discussion and leave a comment.
          </div>
        )}

        <div className="space-y-6">
          {blog.comments && blog.comments.length > 0 ? (
            blog.comments.map((comment) => (
              <div key={comment._id} className="flex gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition duration-300">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 shrink-0 border-2 border-white shadow-sm">
                  {comment.user?.avatarUrl ? (
                    <img src={comment.user.avatarUrl} alt={comment.user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex justify-center items-center font-bold text-gray-500 text-lg">
                      {comment.user?.name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-gray-900 mr-2 text-lg">{comment.user?.name}</span>
                      <span className="text-xs text-gray-500 font-mono">@{comment.user?.username} • {new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    {((user?._id && comment.user?._id && user._id === comment.user._id) || (user?._id && blog.author?._id && user._id === blog.author._id) || isAdmin) && (
                      <button 
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                        title="Delete comment"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
              <p className="text-gray-400 font-medium">No comments yet. Be the first to start the conversation!</p>
            </div>
          )}
        </div>
      </div>

      <ToastContainer position="bottom-right" />
    </div>
  );
}
