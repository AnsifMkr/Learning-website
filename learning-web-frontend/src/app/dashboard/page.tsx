'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AvatarUploader from '../components/AvatarUploader';
import ProgressBar from '../components/ProgressBar';
import BadgeList from '../components/BadgeList';

type Profile = {
  name: string;
  email: string;
  mobile?: string;
  role: 'user' | 'admin';
  xp: number;
  completedLessons: string[];
  badges: string[];
  avatarUrl?: string;
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const token = useSelector((state: RootState) => state.auth.token);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push('/auth');
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data } = await axios.get<Profile>('/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(data);
      } catch (err: any) {
        console.error(err);
        toast.error('Failed to load profile. Please log in again.');
        localStorage.removeItem('token');
        router.push('/auth');
      }
    };

    fetchProfile();
  }, [token, router]);

  const handleAvatarUpload = (url: string) => {
    if (profile) setProfile({ ...profile, avatarUrl: url });
  };

  if (!profile) {
    return <div className="p-6 text-center">Loading profile…</div>;
  }

  return (
    <>
      <div className="max-w-3xl mx-auto p-6 space-y-6 bg-white rounded-lg shadow">
        {/* Avatar & Basic Info */}
        <div className="flex flex-col items-center space-y-4">
          <AvatarUploader
            currentUrl={profile.avatarUrl}
            onUpload={handleAvatarUpload}
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            <p className="text-gray-600">{profile.email}</p>
            {profile.mobile && <p className="text-gray-600">{profile.mobile}</p>}
            <p className="text-sm text-gray-500">Role: {profile.role}</p>
          </div>
        </div>

        {/* XP Progress */}
        <div>
          <h2 className="font-semibold mb-2">XP Progress</h2>
          <ProgressBar xp={profile.xp} xpPerLevel={100} />
          <p className="text-sm text-gray-500 mt-1">
            {profile.xp % 100} / 100 XP towards next level
          </p>
        </div>

        {/* Badges */}
        <div>
          <h2 className="font-semibold mb-2">Badges Earned</h2>
          <BadgeList badges={profile.badges} />
        </div>

        {/* Progress Card */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Lessons Completed</h2>
          <p className="text-gray-700 mb-2">
            {profile.completedLessons.length} lesson
            {profile.completedLessons.length !== 1 ? 's' : ''} completed
          </p>
          <ul className="list-disc list-inside text-gray-700">
            {profile.completedLessons.map(id => (
              <li key={id}>{id}</li>
            ))}
          </ul>
        </div>
      </div>

      <ToastContainer position="top-center" />
    </>
  );
}
