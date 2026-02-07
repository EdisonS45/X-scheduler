import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { ToastProvider } from './Toast';

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <svg className="h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                </svg>
                <h1 className="text-xl font-bold text-indigo-600">X Scheduler</h1>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600 hidden sm:block">
                  {user?.email}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600"
                >
                  <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main>
          <Outlet />
        </main>
      </div>
    </ToastProvider>
  );
}
