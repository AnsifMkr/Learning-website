'use client';
import { SignIn } from '@clerk/nextjs';

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <SignIn routing="hash" fallbackRedirectUrl="/" />
    </div>
  );
}
