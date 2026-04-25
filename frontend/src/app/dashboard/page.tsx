'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios-config';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';

import AvatarUploader from '../components/AvatarUploader';
import ProgressBar from '../components/ProgressBar';
import BadgeList from '../components/BadgeList';
import { getLevelData } from '@/lib/levelSystem';

type Profile = {
  name: string;
  username?: string;
  email: string;
  mobile?: string;
  role: 'user' | 'admin';
  xp: number;
  completedLessons: string[];
  badges: string[];
  avatarUrl?: string;
  currentYearStreak: number;
  longestStreak: number;
  yearlyActivity?: { [key: string]: number };
};

interface LeaderboardUser {
  name: string;
  username?: string;
  avatarUrl?: string;
  xp: number;
}

// Build monthly grids for Jan to Dec of current year
interface MonthData {
  month: string;
  year: number;
  monthIndex: number;
  weeks: (number | null)[][];
}

function getMonthlyActivityGrids(yearlyActivity?: { [key: string]: number }): MonthData[] {
  const months: MonthData[] = [];
  const currentYear = new Date().getFullYear();
  
  // Show Jan to Dec of current year
  for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
    const monthDate = new Date(currentYear, monthIndex, 1);
    const year = monthDate.getFullYear();
    const month = monthDate.toLocaleString('default', { month: 'short' });
    
    // Get the last day of the month
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();
    const firstDay = monthDate.getDay();
    
    const weeks: (number | null)[][] = [];
    let currentWeek: (number | null)[] = [];
    
    // Add empty cells for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= lastDay; day++) {
      const dateKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const count = yearlyActivity?.[dateKey] || 0;
      currentWeek.push(count);
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    
    // Add remaining days
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }
    
    months.push({ month, year, monthIndex, weeks });
  }
  
  return months;
}

function getActivityColor(count: number | null): string {
  if (count === null) return 'bg-gray-100';
  if (count === 0) return 'bg-emerald-100';
  if (count === 1) return 'bg-emerald-300';
  if (count <= 3) return 'bg-emerald-500';
  return 'bg-emerald-700';
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedUsername, setEditedUsername] = useState('');

  const { getToken, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!userId) {
      router.push('/auth');
      return;
    }

    const fetchProfileData = async () => {
      try {
        const token = await getToken();
        if (!token) {
          router.push('/auth');
          return;
        }

        const { data } = await axios.get<Profile>('/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(data);
        setEditedName(data.name || '');
        setEditedUsername(data.username || '');
      } catch (err: any) {
        console.error('Profile fetch error FULL:', err);
        if (err.response) {
          console.error('Error response data:', err.response.data);
          console.error('Error block:', err.response);
        }
        toast.error('Could not load your profile.');
      }
    };

    const fetchLeaderboard = async () => {
      try {
        const { data } = await axios.get('/api/users/leaderboard');
        setTopUsers(data.slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch mini leaderboard', err);
      }
    };

    fetchProfileData();
    fetchLeaderboard();
  }, [userId, getToken, router]);

  const handleAvatarUpload = (url: string) => {
    if (profile) setProfile({ ...profile, avatarUrl: url });
  };

  const handleUpdateProfile = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const { data } = await axios.put<Profile>(
        '/api/users/profile',
        { name: editedName, username: editedUsername },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(data);
      setIsEditing(false);
      toast.success('Profile saved!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save profile');
    }
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const monthlyGrids = getMonthlyActivityGrids(profile.yearlyActivity);
  const streak = profile.currentYearStreak ?? 0;
  const longest = profile.longestStreak ?? 0;
  
  // Progressive Gamification Data
  const { currentLevel, xpInCurrentLevel, totalXpNeededForNextLevel } = getLevelData(profile.xp);

  return (
    <>
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Admin Navigation Panel */}
        {profile.role === 'admin' && (
          <div className="bg-gradient-to-r from-teal-900 to-teal-700 rounded-xl shadow-lg p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black mb-1 flex items-center gap-2">🛡️ Administrator Console</h2>
              <p className="text-teal-100 text-sm">Elevated privileges active.</p>
            </div>
            <button onClick={() => router.push('/courses')} className="bg-white text-teal-900 px-6 py-2 rounded-lg font-bold shadow hover:bg-gray-100 transition">
              Manage Catalog
            </button>
          </div>
        )}

        {/* TOP ROW: Gamer ID & Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Gamer ID Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900 to-blue-900 rounded-2xl shadow-xl overflow-hidden relative text-white flex flex-col sm:flex-row">
            {/* BG Decorations */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-5 pointer-events-none"></div>
            <div className="absolute bottom-0 right-32 -mb-12 w-32 h-32 rounded-full bg-blue-500 opacity-20 blur-2xl pointer-events-none"></div>
            
            {/* Avatar Section */}
            <div className="p-8 flex flex-col items-center justify-center relative">
              <div className="relative z-10">
                <AvatarUploader currentUrl={profile.avatarUrl} onUpload={handleAvatarUpload} />
              </div>
            </div>

            {/* Profile Info Section */}
            <div className="p-8 flex-1 flex flex-col justify-center sm:pl-0">
              {isEditing ? (
                <div className="space-y-4 max-w-sm bg-white/10 p-4 rounded-xl backdrop-blur-md">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-blue-200 mb-1">Name</label>
                    <input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)} className="w-full bg-black/20 border-none text-white p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-blue-200 mb-1">Username</label>
                    <input type="text" value={editedUsername} onChange={(e) => setEditedUsername(e.target.value)} className="w-full bg-black/20 border-none text-white p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={handleUpdateProfile} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-400 transition font-bold text-sm">Save</button>
                    <button onClick={() => setIsEditing(false)} className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition font-bold text-sm">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black tracking-tight">{profile.name}</h1>
                        {profile.role === 'admin' && (
                          <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-blue-200 font-mono mt-1 text-sm bg-black/20 inline-block px-2 py-1 rounded">@{profile.username || 'setup-username'}</p>
                    </div>
                    <button onClick={() => { setEditedName(profile.name); setEditedUsername(profile.username || ''); setIsEditing(true); }} className="text-blue-200 hover:text-white transition">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  </div>

                  {/* Level Progress Bar below name */}
                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-sm font-bold text-blue-100">
                      <span>XP Progress</span>
                      <span>{xpInCurrentLevel} / {totalXpNeededForNextLevel} XP</span>
                    </div>
                    <ProgressBar xp={profile.xp} />
                    <p className="text-xs text-blue-200 text-right mt-1">Total Lifetime XP: {profile.xp}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mini Action & Leaderboard Column (Col 3) */}
          <div className="flex flex-col gap-6">
            {/* Quick Resume / CTA Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center items-center text-center relative overflow-hidden group hover:shadow-md transition">
              <div className="absolute inset-0 bg-blue-50 transform scale-y-0 origin-bottom transition-transform duration-300 group-hover:scale-y-100"></div>
              <div className="relative z-10 w-full">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="font-bold text-gray-800">Ready to level up?</h3>
                <p className="text-sm text-gray-500 mt-1 mb-4">{totalXpNeededForNextLevel - xpInCurrentLevel} XP away from Level {currentLevel + 1}</p>
                <Link href="/courses" className="inline-block w-full bg-blue-600 text-white font-bold py-2 px-6 rounded-xl shadow hover:bg-blue-700 hover:-translate-y-0.5 transition transform">
                  Go Learn
                </Link>
              </div>
            </div>

            {/* Mini Leaderboard */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col">
              <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
                <h3 className="font-bold text-gray-800 flex items-center gap-2"><span className="text-lg">🏆</span> Top Learners</h3>
                <Link href="/leaderboard" className="text-xs font-bold text-blue-600 hover:underline">View All</Link>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-center gap-3">
                {topUsers.length === 0 ? (
                  <div className="flex justify-center p-4"><div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
                ) : (
                  topUsers.map((u, i) => (
                    <div key={i} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <span className={`font-black text-sm w-4 ${i===0 ? 'text-yellow-400' : i===1 ? 'text-gray-400' : 'text-amber-600'}`}>#{i+1}</span>
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt="" className="w-8 h-8 rounded-full bg-gray-200 object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">{u.name.charAt(0)}</div>
                        )}
                        <span className="font-semibold text-gray-700 text-sm truncate max-w-[80px]" title={u.name}>{u.name}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{u.xp}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Gamification Stats */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">🎖 Achievement Gallery</h2>
              <p className="text-gray-500 mt-1 text-sm">You have unlocked {profile.badges.length} badges across {profile.completedLessons.length} lessons.</p>
            </div>
          </div>
          <BadgeList badges={profile.badges} />
        </div>

        {/* Yearly Activity Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">🌱 Learning Consistency</h2>
              <p className="text-gray-500 text-sm">Your activity map for this year.</p>
            </div>
            {/* Streak Info */}
            <div className="flex gap-4">
              <div className="text-center px-4 py-2 bg-orange-50 rounded-lg">
                <div className="text-xs font-bold text-orange-400 uppercase">Current</div>
                <div className="font-black text-xl text-orange-600">{streak} <span className="text-sm">🔥</span></div>
              </div>
              <div className="text-center px-4 py-2 bg-yellow-50 rounded-lg">
                <div className="text-xs font-bold text-yellow-500 uppercase">Best</div>
                <div className="font-black text-xl text-yellow-600">{longest} <span className="text-sm">⭐</span></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {monthlyGrids.map((monthData, idx) => (
              <div key={idx} className="bg-gray-50/50 rounded-lg p-3 relative group">
                <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider text-center">
                  {monthData.month}
                </h3>
                <div className="flex justify-center mb-1">
                  <div className="flex gap-0.5 text-[10px] font-bold text-gray-400">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                      <span key={index} className="w-2.5 text-center">{day}</span>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  {monthData.weeks.map((week, weekIdx) => (
                    <div key={weekIdx} className="flex gap-0.5 justify-center">
                      {week.map((count, dayIdx) => (
                        <div
                          key={dayIdx}
                          title={count === null ? '' : count === 0 ? 'No activity' : `${count} contributions`}
                          className={`w-2.5 h-2.5 rounded-sm transition-all hover:scale-150 cursor-crosshair ${getActivityColor(count)} ${count !== null ? 'hover:ring-1 hover:ring-gray-400 z-10' : 'opacity-0'}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
}
