'use client';

interface ProgressBarProps {
  xp: number;          // total xp
  xpPerLevel?: number; // how much xp to fill a level (default 100)
}

export default function ProgressBar({ xp, xpPerLevel = 100 }: ProgressBarProps) {
  const current = xp % xpPerLevel;
  const pct = Math.min(100, (current / xpPerLevel) * 100);

  return (
    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
      <div
        className="h-full bg-green-500 transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
