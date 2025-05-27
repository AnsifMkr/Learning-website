'use client';

import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const token = useSelector((state: RootState) => state.auth.token);
  const router = useRouter();

  const handleGetStarted = () => {
    if (token) {
      router.push('/lessons');
    } else {
      router.push('/auth');
    }
  };

  const skillPaths = [
    {
      id: 'frontend',
      title: 'Frontend Development',
      description: 'Learn React, Next.js, Tailwind CSS and build interactive UIs.',
      icon: '/icons/frontend.svg',
    },
    {
      id: 'backend',
      title: 'Backend Development',
      description: 'Master Node.js, Express, MongoDB and build scalable APIs.',
      icon: '/icons/backend.svg',
    },
    {
      id: 'fullstack',
      title: 'Full-Stack Development',
      description: 'Combine frontend and backend to create end-to-end web apps.',
      icon: '/icons/fullstack.svg',
    },
  ];

  return (
    <main className="space-y-20">
      {/* Hero Section */}
      <section className="bg-blue-800 text-white text-center py-20">
        <h1 className="text-5xl font-bold mb-4">Welcome to SkillSpark</h1>
        <p className="text-xl max-w-2xl mx-auto mb-8">
          Ignite your learning journey with structured lessons, interactive quizzes, and real-world projects.
        </p>
        <button
          onClick={handleGetStarted}
          className="bg-yellow-400 text-blue-800 px-8 py-3 rounded-full text-lg font-medium hover:bg-yellow-300 transition"
        >
          Get Started
        </button>
      </section>

      {/* Skill Paths */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-semibold text-center mb-10">Choose Your Path</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {skillPaths.map((path) => (
            <Link
              key={path.id}
              href={`/lessons/path/${path.id}`}
              className="bg-white shadow hover:shadow-lg rounded-lg p-6 text-center transition"
            >
              <img src={path.icon} alt={path.title} className="mx-auto mb-4 h-16" />
              <h3 className="text-xl font-bold mb-2">{path.title}</h3>
              <p className="text-gray-600">{path.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-100 py-20">
        <div className="container mx-auto px-4 space-y-10">
          <h2 className="text-3xl font-semibold text-center">Platform Highlights</h2>
          <ul className="grid md:grid-cols-3 gap-8">
            <li className="flex flex-col items-center text-center">
              <img src="/icons/interactive.svg" alt="" className="h-12 mb-4" />
              <h4 className="font-medium mb-2">Interactive Quizzes</h4>
              <p className="text-gray-600">Test your knowledge as you learn with instant feedback.</p>
            </li>
            <li className="flex flex-col items-center text-center">
              <img src="/icons/progress.svg" alt="" className="h-12 mb-4" />
              <h4 className="font-medium mb-2">Progress Tracking</h4>
              <p className="text-gray-600">Earn XP and badges to track your achievements.</p>
            </li>
            <li className="flex flex-col items-center text-center">
              <img src="/icons/certificate.svg" alt="" className="h-12 mb-4" />
              <h4 className="font-medium mb-2">Certificates</h4>
              <p className="text-gray-600">Get certified on completion of each skill path.</p>
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
