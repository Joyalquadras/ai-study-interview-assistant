// frontend/src/layouts/MainLayout.jsx
import React from 'react';
import { Sidebar } from '../components/common/Sidebar';
import { GuestBanner } from '../components/common/GuestBanner';
import { useAuthStore } from '../context/authStore';

export const MainLayout = ({ children }) => {
  const { isGuest } = useAuthStore();

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {isGuest && <GuestBanner />}
      <div className="flex flex-1 min-h-0 w-full">
        <Sidebar />
        <div className="flex-1 overflow-auto min-w-0">
          <main className="p-4 sm:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
};
