// filepath: learning-web-frontend/src/types/index.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  completedLessons: string[];
  badges: string[];
  xp: number;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'video';
  skillPath: string;
  day: number;
}

export interface Quiz {
  lessonId: string;
  questions: Question[];
  timeLimit: number;
}

export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Otp {
  identifier: string; // mobile number or email
  otp: string;
  createdAt: Date;
}