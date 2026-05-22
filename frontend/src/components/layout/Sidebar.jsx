// frontend/src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../context/authStore';
import { Button } from '../common/CommonComponents';

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
    isActive
      ? 'bg-blue-500 text-white'
      : 'hover:bg-blue-500/80 text-white'
  }`;

export const Sidebar = () => {
  const { user, logout } = useAuthStore();

  const careerTools = [
    { label: 'Gap Analyzer', href: '/gap-analyzer', icon: '🎯' },
    { label: 'STAR Stories', href: '/star-stories', icon: '📖' },
    { label: 'Quiz Analytics', href: '/quiz-analytics', icon: '📊' },
  ];

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    { label: 'Notes', href: '/notes', icon: '📝' },
    { label: 'Chat', href: '/chat', icon: '💬' },
    { label: 'Resume Analyzer', href: '/resume', icon: '📄' },
    { label: 'Study Plans', href: '/study-plans', icon: '📚' },
    { label: 'Mock Interview', href: '/mock-interview', icon: '🎯' },
  ];

  return (
    <div className="w-64 shrink-0 bg-gradient-to-b from-blue-600 to-blue-800 text-white h-screen flex flex-col">
      <div className="p-6 border-b border-blue-500">
        <h1 className="text-2xl font-bold">Study AI</h1>
        <p className="text-blue-100 text-sm">Ace Your Exams & Interviews</p>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <p className="px-4 text-xs font-semibold uppercase tracking-wider text-blue-200 mb-2">
          Career Tools
        </p>
        <div className="space-y-1 mb-6">
          {careerTools.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={linkClass}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>

        <p className="px-4 text-xs font-semibold uppercase tracking-wider text-blue-200 mb-2">
          Study
        </p>
        <div className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={linkClass}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-blue-500 space-y-4">
        <div className="bg-blue-500 rounded-lg p-3">
          <p className="text-sm font-semibold">{user?.name}</p>
          <p className="text-xs text-blue-100">{user?.email}</p>
        </div>
        <Button variant="secondary" className="w-full" onClick={logout}>
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
