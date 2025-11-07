import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import MentorLoveNote from '../components/MentorLoveNote'; // ✅ Added this import
import { UserPlusIcon } from '@heroicons/react/24/solid'; // Optional nice icon for Register button

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(email, password);
      // Navigation handled by AuthContext
    } catch (message) {
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-screen flex flex-col md:flex-row">
      
      {/* -------------------- 1. Mentor Note Section (75% width) -------------------- */}
      <div className="w-full md:w-3/4 bg-slate-50 p-4 sm:p-6 flex items-center justify-center">
        <div className="max-w-full w-full">
          <MentorLoveNote />
        </div>
      </div>
      
      {/* -------------------- 2. Register Form Section (25% width) -------------------- */}
      <div className="w-full md:w-1/4 p-8 flex items-center justify-center bg-white shadow-2xl">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <svg
              className="h-10 w-10 text-sky-600 mx-auto"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <h2 className="text-3xl font-bold text-slate-800 mt-3">
              Create your account
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</p>
            )}

            <div>
              <label
                className="block text-sm font-medium text-slate-700 mb-1"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-slate-700 mb-1"
                htmlFor="password"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-slate-700 mb-1"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-sky-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-sky-700 transition duration-150 disabled:bg-sky-300"
            >
              <UserPlusIcon className="h-5 w-5" />
              {loading ? 'Creating...' : 'Register'}
            </button>
          </form>

          <p className="text-sm text-center text-slate-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-sky-600 hover:text-sky-500">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
