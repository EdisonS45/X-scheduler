import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-sky-600">X Scheduler</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user?.email}</span>
            <button
              onClick={logout}
              className="text-sm font-medium text-slate-700 hover:text-sky-600"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>
      <main>
        <Outlet /> 
      </main>
    </div>
  );
}