import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import MentorLoveNote from '../components/MentorLoveNote';
import { LockClosedIcon } from '@heroicons/react/24/solid';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (message) {
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-screen flex flex-col md:flex-row">
      
      {/* -------------------- 1. Mentor Note Section (Now takes 75% of screen width) -------------------- */}
      <div className="w-full md:w-3/4 bg-slate-50 p-4 sm:p-6 flex items-center justify-center">
        <div className="max-w-full w-full">
          <MentorLoveNote />
        </div>
      </div>
      
      {/* -------------------- 2. Login Form Section (Now takes 25% of screen width) -------------------- */}
      <div className="w-full md:w-1/4 p-8 flex items-center justify-center bg-white shadow-2xl">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <svg className="h-10 w-10 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
            </svg>
            <h2 className="text-3xl font-bold text-slate-800 mt-3">Sign in to your account</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</p>}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition duration-150 disabled:bg-indigo-300"
            >
              <LockClosedIcon className="h-5 w-5" />
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>
          
          <p className="text-sm text-center text-slate-600 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}