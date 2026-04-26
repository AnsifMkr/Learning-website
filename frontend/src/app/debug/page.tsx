'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios-config';

export default function DebugPage() {
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [envVars, setEnvVars] = useState<any>({});

  useEffect(() => {
    // Check backend connectivity
    axios.get('/health')
      .then(response => {
        setBackendStatus(`✅ Connected: ${response.data.status}`);
      })
      .catch(error => {
        setBackendStatus(`❌ Error: ${error.message}`);
      });

    // Check environment variables
    setEnvVars({
      NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'Set' : 'Not set',
      NODE_ENV: process.env.NODE_ENV,
    });
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔧 Debug Information</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Backend Connection</h2>
          <p className="text-lg">{backendStatus}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            {JSON.stringify(envVars, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">API Endpoints to Test</h2>
          <div className="space-y-2">
            <p><strong>Health Check:</strong> {process.env.NEXT_PUBLIC_BACKEND_URL}/api/health</p>
            <p><strong>Leaderboard:</strong> {process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/leaderboard</p>
            <p><strong>Profile:</strong> {process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/profile</p>
          </div>
        </div>
      </div>
    </div>
  );
}