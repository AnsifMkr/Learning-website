'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { logout } from '../store/authSlice';

export default function Navbar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { token } = useSelector((s: RootState) => s.auth);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <nav className="bg-blue-800 text-white shadow-md relative overflow-visible">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Brand */}
        <Link href="/" className="text-2xl font-bold">
          SkillSpark
        </Link>

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 mx-8">
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search lessons..."
            className="w-full max-w-md px-4 py-2 rounded-full bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
          />
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-6 font-medium">
          {!token ? (
            <Link href="/auth" className="hover:text-yellow-400 transition">
              Login / Register
            </Link>
          ) : (
            <>
              <Link href="/lessons" className="hover:text-yellow-400 transition">
                Lessons
              </Link>
              <Link href="/dashboard" className="hover:text-yellow-400 transition">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="bg-yellow-400 text-blue-800 px-4 py-1 rounded-full hover:bg-white hover:text-blue-800 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="md:hidden flex flex-col justify-between items-center p-2 w-8 h-8 focus:outline-none z-30 overflow-visible"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span
            className={`block h-0.5 w-full bg-white transform origin-center transition duration-300 ${
              open ? 'rotate-45 translate-y-1.5' : ''
            }`}
          />
          <span
            className={`block h-0.5 w-full bg-white my-1 transform origin-center transition duration-300 ${
              open ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block h-0.5 w-full bg-white transform origin-center transition duration-300 ${
              open ? '-rotate-45 -translate-y-1.5' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-blue-800 text-white transition-max-height duration-300 overflow-hidden ${
          open ? 'max-h-screen' : 'max-h-0'
        }`}
      >
        <div className="px-4 py-4 space-y-4">
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search lessons..."
            className="w-full px-4 py-2 rounded-full bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
          />

          {!token ? (
            <Link
              href="/auth"
              onClick={() => setOpen(false)}
              className="block text-center py-2 rounded hover:bg-yellow-400 hover:text-blue-800 transition"
            >
              Login / Register
            </Link>
          ) : (
            <>
              <Link
                href="/lessons"
                onClick={() => setOpen(false)}
                className="block text-center py-2 rounded hover:bg-yellow-400 hover:text-blue-800 transition"
              >
                Lessons
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="block text-center py-2 rounded hover:bg-yellow-400 hover:text-blue-800 transition"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setOpen(false);
                }}
                className="w-full text-center py-2 bg-yellow-400 text-blue-800 rounded-full hover:bg-white hover:text-blue-800 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
