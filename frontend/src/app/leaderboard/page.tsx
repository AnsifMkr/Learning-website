'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface LeaderboardUser {
  name: string;
  username?: string;
  avatarUrl?: string;
  badges: string[];
  xp: number;
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchLeaderboard = async () => {
      try {
        const { data } = await axios.get('/api/users/leaderboard');
        if (isMounted) setUsers(data);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLeaderboard();
    const refreshInterval = setInterval(fetchLeaderboard, 5000);

    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-indigo-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-6 duration-700">
          <h1 className="text-5xl font-black text-white mb-4 drop-shadow-md">🏆 Global Leaderboard</h1>
          <p className="text-blue-200 text-lg">Top learners gaining XP from lessons and quizzes</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="grid grid-cols-[auto_1fr_auto] gap-4 bg-gray-50 p-4 border-b font-bold text-gray-500 text-sm uppercase px-8">
            <div className="w-8 text-center">#</div>
            <div>Learner</div>
            <div className="text-right">Total XP</div>
          </div>

          <div className="divide-y divide-gray-100">
            {users.map((user, idx) => (
              <div 
                key={idx} 
                className={`grid grid-cols-[auto_1fr_auto] gap-6 items-center p-4 px-8 hover:bg-blue-50 transition duration-300 animate-in fade-in slide-in-from-bottom-${(idx % 5) + 2}`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Rank */}
                <div className="w-8 font-black text-2xl text-center">
                  {idx === 0 ? <span className="text-yellow-400 drop-shadow-sm text-3xl">🥇</span> :
                   idx === 1 ? <span className="text-gray-400 drop-shadow-sm text-3xl">🥈</span> :
                   idx === 2 ? <span className="text-amber-600 drop-shadow-sm text-3xl">🥉</span> :
                   <span className="text-gray-300">{idx + 1}</span>}
                </div>

                {/* Profile */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border-2 border-white shadow-sm flex items-center justify-center">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-gray-400">{user.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg leading-tight">{user.name}</h3>
                    <p className="text-gray-500 font-mono text-xs">@{user.username || 'anonymous'}</p>
                    {user.badges && user.badges.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {user.badges.slice(0, 3).map((b, i) => (
                          <span key={i} title={b} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full border border-yellow-200">
                            {b}
                          </span>
                        ))}
                        {user.badges.length > 3 && <span className="text-xs text-gray-400">+{user.badges.length - 3}</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* XP Score */}
                <div className="text-right">
                  <div className="font-black text-2xl text-blue-600 font-mono">{user.xp}</div>
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">XP</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/courses" className="inline-block bg-white text-blue-900 px-8 py-3 rounded-full font-bold shadow hover:bg-gray-50 transition">
            Gain more XP
          </Link>
        </div>
      </div>
    </div>
  );
}
