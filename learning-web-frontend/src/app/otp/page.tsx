'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { loginSuccess } from '../store/authSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function OtpVerifyPage() {
  const identifier = useSelector((state: RootState) => state.auth.identifier);
  const [otp, setOtp] = useState('');
  const router = useRouter();
  const dispatch = useDispatch();

  const handleVerifyOtp = async () => {
    try {
      const { data } = await axios.post('/api/auth/verify-otp', { identifier, otp });
      dispatch(loginSuccess({ user: data.user, token: data.token }));
      if (typeof window !== 'undefined') localStorage.setItem('token', data.token);
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid or expired OTP');
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded shadow w-full max-w-sm">
          <h2 className="text-xl font-semibold mb-4 text-center">Enter OTP</h2>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="w-full p-2 border rounded mb-4"
          />
          <button
            onClick={handleVerifyOtp}
            className="bg-green-500 text-white w-full py-2 rounded hover:bg-green-600 transition"
          >
            Verify
          </button>
        </div>
      </div>
      <ToastContainer position="top-center" />
    </>
  );
}
