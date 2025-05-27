'use client';
import { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/authSlice';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    role: 'user' as 'user' | 'admin',
  });
  const dispatch = useDispatch();
  const router = useRouter();

  const toggleMode = () => {
    setMode(m => (m === 'login' ? 'register' : 'login'));
    setForm({ name: '', email: '', mobile: '', password: '', role: 'user' });
  };

  const handleSubmit = async () => {
    try {
      if (mode === 'register') {
        await axios.post('/api/auth/register', { ...form });
        toast.success('Registered successfully! Please log in.');
        setMode('login');
      } else {
        const { data } = await axios.post('/api/auth/login', {
          email: form.email,
          password: form.password,
        });
        dispatch(loginSuccess({ user: data.user, token: data.token }));
        if (typeof window !== 'undefined') localStorage.setItem('token', data.token);
        router.push('/');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold text-center mb-6">
          {mode === 'login' ? 'Login' : 'Register'}
        </h1>

        {/* Name (register only) */}
        {mode === 'register' && (
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full mb-3 p-2 border rounded"
          />
        )}

        {/* Email */}
        <input
          type="text"
          placeholder="Email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          className="w-full mb-3 p-2 border rounded"
        />

        {/* Mobile (register only) */}
        {mode === 'register' && (
          <input
            type="text"
            placeholder="Mobile (10 digits)"
            value={form.mobile}
            onChange={e => setForm({ ...form, mobile: e.target.value })}
            className="w-full mb-3 p-2 border rounded"
          />
        )}

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          className="w-full mb-3 p-2 border rounded"
        />

        {/* Role Selector (register only) */}
        {mode === 'register' && (
          <div className="w-full mb-6">
            <label className="block mb-1 font-medium">Role</label>
            <select
              value={form.role}
              onChange={e =>
                setForm({
                  ...form,
                  role: e.target.value as 'user' | 'admin',
                })
              }
              className="w-full p-2 border rounded"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className={
            (mode === 'login'
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-blue-600 hover:bg-blue-700') +
            ' w-full py-2 text-white rounded mb-4'
          }
        >
          {mode === 'login' ? 'Log In' : 'Sign Up'}
        </button>

        {/* Toggle Mode */}
        <p className="text-center text-sm">
          {mode === 'login'
            ? "Don't have an account? "
            : 'Already have an account? '}
          <button
            onClick={toggleMode}
            className="text-blue-600 hover:underline font-medium"
          >
            {mode === 'login' ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}
