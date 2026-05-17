'use client';
import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import axios from 'axios';

// Bypass Next.js API rewrites on the client by directly connecting to the backend.
// This prevents infinite loop issues with Vercel rewrites and improves performance.
axios.defaults.baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://skillspark-backend-tau.vercel.app';

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
