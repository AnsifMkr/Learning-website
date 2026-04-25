'use client';

import React from 'react';

interface BadgeListProps {
  badges: string[]; // e.g. ['50 XP Achiever', 'First Quiz']
}

const EarlyBirdBadge = () => (
  <svg viewBox="0 0 100 100" className="w-24 h-24 drop-shadow-md group-hover:drop-shadow-xl transition-all duration-300">
    <defs>
      <linearGradient id="earlyBirdGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4ade80" />
        <stop offset="100%" stopColor="#166534" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#earlyBirdGrad)" stroke="#22c55e" strokeWidth="3" />
    <path className="transform origin-center transition-transform duration-500 group-hover:rotate-12" d="M30 60 C 35 40, 65 40, 70 60" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" />
    <circle cx="40" cy="45" r="4" fill="white" />
    <circle cx="60" cy="45" r="4" fill="white" />
    <path d="M48 55 L52 55 L50 60 Z" fill="white" />
  </svg>
);

const LessonBadge = () => (
  <svg viewBox="0 0 100 100" className="w-24 h-24 drop-shadow-md group-hover:drop-shadow-xl transition-all duration-300">
    <defs>
      <linearGradient id="lessonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="100%" stopColor="#1e3a8a" />
      </linearGradient>
    </defs>
    <path d="M50 5 L95 25 L95 75 L50 95 L5 75 L5 25 Z" fill="url(#lessonGrad)" stroke="#3b82f6" strokeWidth="3" />
    <path className="transform origin-center transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110" d="M30 40 L50 30 L70 40 L70 60 L50 70 L30 60 Z" fill="none" stroke="white" strokeWidth="4" />
    <path d="M50 30 L50 70" stroke="white" strokeWidth="4" />
    <path d="M30 40 L50 50 L70 40" stroke="white" strokeWidth="4" fill="none"/>
  </svg>
);

const QuizRookieBadge = () => (
  <svg viewBox="0 0 100 100" className="w-24 h-24 drop-shadow-md group-hover:drop-shadow-xl transition-all duration-300">
    <defs>
      <linearGradient id="qrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c084fc" />
        <stop offset="100%" stopColor="#581c87" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#qrGrad)" stroke="#a855f7" strokeWidth="3" />
    <text x="50" y="62" fontSize="40" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" fill="white" className="transform origin-center transition-transform duration-300 group-hover:scale-110">?</text>
    <path d="M15 50 A 35 35 0 0 1 85 50" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="4" strokeDasharray="5,5" className="animate-spin origin-center" style={{ animationDuration: '10s' }} />
  </svg>
);

const QuizMasterBadge = () => (
  <svg viewBox="0 0 100 100" className="w-24 h-24 drop-shadow-md group-hover:drop-shadow-xl transition-all duration-300">
    <defs>
      <linearGradient id="qmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#818cf8" />
        <stop offset="100%" stopColor="#312e81" />
      </linearGradient>
      <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="100%" stopColor="#eab308" />
      </linearGradient>
    </defs>
    <path d="M10 50 L50 10 L90 50 L50 90 Z" fill="url(#qmGrad)" stroke="#6366f1" strokeWidth="3" />
    <path d="M30 50 L45 65 L70 35" fill="none" stroke="url(#gold)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" className="transform origin-center transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-1" />
  </svg>
);

const XPAchieverBadge = ({ level }: { level: string }) => (
  <svg viewBox="0 0 100 100" className="w-24 h-24 drop-shadow-md group-hover:drop-shadow-xl transition-all duration-300">
    <defs>
      <linearGradient id="xpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="100%" stopColor="#854d0e" />
      </linearGradient>
    </defs>
    <polygon points="50,5 61,35 95,35 68,55 78,85 50,65 22,85 32,55 5,35 39,35" fill="url(#xpGrad)" stroke="#eab308" strokeWidth="2" className="transform origin-center transition-transform duration-700 group-hover:rotate-180" />
    <circle cx="50" cy="52" r="18" fill="rgba(0,0,0,0.2)" />
    <text x="50" y="58" fontSize="18" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" fill="white">{level}</text>
  </svg>
);

const XPVanguardBadge = () => (
  <svg viewBox="0 0 100 100" className="w-24 h-24 drop-shadow-md group-hover:drop-shadow-xl transition-all duration-300">
    <defs>
      <linearGradient id="vanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fcd34d" />
        <stop offset="50%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
    </defs>
    <path d="M50 5 L95 25 L95 75 L50 95 L5 75 L5 25 Z" fill="#451a03" stroke="url(#vanGrad)" strokeWidth="4" />
    <path d="M50 15 L85 32 L85 68 L50 85 L15 68 L15 32 Z" fill="url(#vanGrad)" />
    <text x="50" y="58" fontSize="24" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" fill="#fffbeb" className="transform origin-center transition-transform duration-500 group-hover:scale-125">100</text>
  </svg>
);

const StreakBadge = () => (
  <svg viewBox="0 0 100 100" className="w-24 h-24 drop-shadow-md group-hover:drop-shadow-xl transition-all duration-300">
    <defs>
      <linearGradient id="streakGrad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#fdba74" />
        <stop offset="100%" stopColor="#c2410c" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="#fff7ed" stroke="#fdba74" strokeWidth="4" />
    <path d="M45 20 C65 20 70 45 70 60 C70 80 50 85 50 85 C50 85 30 80 30 60 C30 45 35 20 45 20 Z" fill="url(#streakGrad)" className="transform origin-center transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1" />
    <path d="M50 40 C60 40 60 55 60 65 C60 75 50 80 50 80 C50 80 40 75 40 65 C40 55 40 40 50 40 Z" fill="#fef08a" className="transform origin-center transition-transform duration-500 group-hover:-translate-y-1 delay-75" />
  </svg>
);

const ConsistencyBadge = () => (
  <svg viewBox="0 0 100 100" className="w-24 h-24 drop-shadow-md group-hover:drop-shadow-xl transition-all duration-300">
    <defs>
      <linearGradient id="consGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fca5a5" />
        <stop offset="100%" stopColor="#991b1b" />
      </linearGradient>
    </defs>
    <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="none" stroke="url(#consGrad)" strokeWidth="6" />
    <circle cx="50" cy="50" r="35" fill="url(#consGrad)" className="transform origin-center transition-all duration-500 group-hover:scale-95" />
    <path d="M35 50 L45 60 L65 40" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="50" cy="50" r="35" fill="none" stroke="white" strokeWidth="2" strokeDasharray="5,5" className="animate-spin origin-center" style={{ animationDuration: '15s' }} />
  </svg>
);

const DefaultBadge = () => (
  <svg viewBox="0 0 100 100" className="w-24 h-24 drop-shadow-md group-hover:drop-shadow-xl transition-all duration-300">
    <defs>
      <linearGradient id="defGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#defGrad)" stroke="#94a3b8" strokeWidth="3" />
    <rect x="35" y="35" width="30" height="30" fill="white" rx="5" className="transform origin-center transition-transform duration-500 group-hover:rotate-45" />
  </svg>
);

const getBadgeComponent = (badgeName: string) => {
  switch (badgeName) {
    case 'Early Bird': return <EarlyBirdBadge />;
    case 'First Five Lessons': return <LessonBadge />;
    case 'Quiz Rookie': return <QuizRookieBadge />;
    case 'Quiz Master': return <QuizMasterBadge />;
    case '50 XP Achiever': return <XPAchieverBadge level="50" />;
    case '100 XP Vanguard': return <XPVanguardBadge />;
    case 'Streak Starter': return <StreakBadge />;
    case 'Consistency Scholar': return <ConsistencyBadge />;
    default: return <DefaultBadge />;
  }
};

const getBadgeDescription = (badgeName: string) => {
  switch (badgeName) {
    case 'Early Bird': return 'First to join!';
    case 'First Five Lessons': return 'Completed 5 lessons';
    case 'Quiz Rookie': return 'Took your first quiz';
    case 'Quiz Master': return 'Aced a quiz perfectly';
    case '50 XP Achiever': return 'Earned 50 XP';
    case '100 XP Vanguard': return 'Earned 100 XP';
    case 'Streak Starter': return 'Hit a 3-day streak';
    case 'Consistency Scholar': return 'Long-term dedication';
    default: return 'Achievement unlocked';
  }
}

export default function BadgeList({ badges }: BadgeListProps) {
  if (!badges || badges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p className="text-gray-500 font-medium text-center">No badges explicitly unlocked yet.</p>
        <p className="text-sm text-gray-400 mt-1">Complete lessons and quizzes to earn them!</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 content-start py-4">
      {badges.map((b, i) => (
        <div key={i} className="flex flex-col items-center gap-3 group cursor-pointer" title={getBadgeDescription(b)}>
          <div className="relative transform transition-transform duration-500 group-hover:-translate-y-2">
            {getBadgeComponent(b)}
          </div>
          <div className="text-center">
            <h3 className="font-bold text-gray-800 text-sm leading-tight transition-colors group-hover:text-blue-600">{b}</h3>
            <p className="text-xs text-gray-500 mt-1 h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-300">{getBadgeDescription(b)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
