'use client';
import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { loginSuccess, logout } from '../store/authSlice';

/**
 * Syncs the authenticated Clerk session into Redux by fetching the full
 * user profile from our own backend. This ensures completedLessons, xp,
 * badges, streak, and the real MongoDB _id are always available in the store.
 */
export default function ClerkReduxSync() {
  const { getToken, userId } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    const sync = async () => {
      if (!userId) {
        dispatch(logout());
        if (typeof window !== 'undefined') localStorage.removeItem('token');
        return;
      }

      try {
        const token = await getToken(); // Get the default Clerk JWT token
        if (!token) {
          console.log('No token from Clerk, userId:', userId);
          return;
        }

        console.log('Got Clerk token, attempting to fetch profile...');

        // Save token for API calls elsewhere
        if (typeof window !== 'undefined') localStorage.setItem('token', token);

        // Fetch the full user from our backend — includes MongoDB _id,
        // completedLessons, xp, badges, streak, role, etc.
        const { data: profile } = await axios.get('/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('Profile fetched successfully:', profile);
        dispatch(loginSuccess({ token, user: profile }));
      } catch (err) {
        console.error('ClerkReduxSync: failed to fetch profile', err);
        // Still dispatch Clerk identity so the session isn't broken
        dispatch(logout());
      }
    };

    sync();
  }, [userId, getToken, dispatch]);

  return null;
}
