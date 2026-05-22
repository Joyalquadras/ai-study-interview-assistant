// frontend/src/components/common/GuestBanner.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DISMISS_KEY = 'guestBannerDismissed';

export const GuestBanner = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY) === 'true';
    setVisible(!dismissed);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="shrink-0 w-full z-50 bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-700 px-4 py-3"
      role="banner"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm text-amber-900 dark:text-amber-100 text-center sm:text-left">
          👋 You&apos;re in Guest Mode — data resets periodically.{' '}
          <span className="hidden sm:inline">
            Register to save your progress.
          </span>
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="px-4 py-1.5 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
          >
            Register Free
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-800/50 text-lg font-bold"
            aria-label="Dismiss banner"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestBanner;
