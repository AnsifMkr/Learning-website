'use client';

import { useState, ChangeEvent } from 'react';
import axios from 'axios';

interface AvatarUploaderProps {
  currentUrl?: string;
  onUpload: (url: string) => void;
}

export default function AvatarUploader({ currentUrl, onUpload }: AvatarUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const form = new FormData();
    form.append('avatar', file);
    setUploading(true);

    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post('/api/users/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' ,
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      onUpload(data.avatarUrl);
    } catch (err) {
      console.error('Upload failed', err);
      alert('Avatar upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <img
        src={currentUrl || '/default-avatar.png'}
        alt="Avatar"
        className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
      />
      <label className="cursor-pointer text-blue-600 hover:underline text-sm">
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
