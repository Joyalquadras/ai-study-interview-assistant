import React from 'react';
import { Sidebar } from '../components/layout/Sidebar';

export const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <main className="p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
