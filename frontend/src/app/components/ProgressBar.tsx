'use client';

import { getLevelData } from '@/lib/levelSystem';

interface ProgressBarProps {
  xp: number;          // total xp
}

export default function ProgressBar({ xp }: ProgressBarProps) {
  const { progressPercentage } = getLevelData(xp);

  return (
    <div className="w-full bg-blue-100 rounded-full h-4 overflow-hidden relative shadow-inner">
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000 ease-out"
        style={{ width: `${progressPercentage}%` }}
      >
        {/* Adds a slight gloss effect to the progress bar */}
        <div className="w-full h-1/2 bg-white opacity-20 absolute top-0" />
      </div>
    </div>
  );
}
