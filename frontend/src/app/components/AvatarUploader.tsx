'use client';

import { useState, ChangeEvent } from 'react';
import { useAuth } from '@clerk/nextjs';
import axios from 'axios';

interface AvatarUploaderProps {
  currentUrl?: string;
  onUpload: (url: string) => void;
}

export default function AvatarUploader({ currentUrl, onUpload }: AvatarUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const { getToken } = useAuth();

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const form = new FormData();
    form.append('avatar', file);
    setUploading(true);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication token not available. Please refresh the page or sign in again.');
      }

      const { data } = await axios.post('/api/users/avatar', form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      onUpload(data.avatarUrl);
    } catch (err: any) {
      const responseData = err?.response?.data;
      const errorData = responseData && Object.keys(responseData).length ? responseData : {
        message: err?.message || 'Unknown error',
      };
      console.error('Upload failed', errorData, err);
      alert(
        responseData?.error ||
        responseData?.message ||
        err?.message ||
        'Avatar upload failed. Check console for details.'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <img
        src={currentUrl || '/default-avatar.png'}
        alt="Avatar"
        className="w-24 h-24 rounded-full object-cover ring-2 ring-white/30 drop-shadow-md"
      />
      <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold py-1.5 px-4 rounded-full transition-all duration-300 shadow-sm backdrop-blur-sm">
        {uploading ? 'Uploading…' : 'Change Avatar'}
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
          disabled={uploading}
        />
      </label>
    </div>
  );
}
