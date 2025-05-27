'use client';

import Link from 'next/link';
import React from 'react';

interface CourseCardProps {
  id: string;
  title: string;
  excerpt: string;
  day: number;
  type: 'text' | 'video';
}

export default function CourseCard({ id, title, excerpt, day, type }: CourseCardProps) {
  return (
    <Link
      href={`/lessons/${id}`}
      className="block bg-white rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-1 transition p-6"
    >
      {/* Placeholder Image */}
      <div className="h-40 w-full bg-gray-100 rounded-md mb-4 flex items-center justify-center">
        <span className="text-3xl text-gray-300">{type === 'video' ? '🎬' : '📄'}</span>
      </div>

      {/* Content */}
      <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{excerpt}</p>

      <div className="flex justify-between items-center text-gray-500 text-xs">
        <span>Day {day}</span>
        <span className="capitalize">{type}</span>
      </div>
    </Link>
  );
}
