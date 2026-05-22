// frontend/src/pages/LandingPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/authStore';
import { showToast } from '../components/common/CommonComponents';
import { getErrorMessage } from '../utils/helpers';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { guestLogin } = useAuthStore();
  const [guestLoading, setGuestLoading] = useState(false);

  const handleGuestLogin = async () => {
    setGuestLoading(true);
    try {
      await guestLogin();
      showToast.success("Welcome! You're exploring as a Guest 👋");
      navigate('/dashboard');
    } catch (error) {
      showToast.error(getErrorMessage(error));
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 sm:px-8 py-4">
        <span className="text-xl font-bold text-white">Study AI</span>
        <Link
          to="/login"
          className="text-sm font-semibold text-white/90 hover:text-white border border-white/40 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          Login
        </Link>
      </header>

      <section className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white px-4 sm:px-8 pt-24 pb-20 sm:pb-28">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            Study AI
          </h1>
          <p className="text-xl sm:text-2xl font-semibold text-indigo-100 mb-3">
            Ace Your Interviews & Exams with AI
          </p>
          <p className="text-base sm:text-lg text-indigo-100/90 max-w-2xl mx-auto mb-8">
            AI-powered mock interviews, resume analyzer, smart flashcards, and
            personalized study plans — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-semibold shadow-lg transition-colors text-center"
            >
              Get Started Free
            </Link>
            <button
              type="button"
              onClick={handleGuestLogin}
              disabled={guestLoading}
              className="w-full sm:w-auto px-8 py-3 rounded-lg bg-white text-indigo-700 font-semibold border-2 border-white hover:bg-indigo-50 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
            >
              {guestLoading ? (
                <>
                  <span className="inline-block w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Try as Guest →'
              )}
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <span className="text-3xl mb-3 block">🎯</span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Mock Interviews
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Practice with AI across HR, JavaScript, React, DSA
            </p>
          </div>
          <div className="rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <span className="text-3xl mb-3 block">📄</span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Resume Analyzer
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Get ATS score and improvement suggestions instantly
            </p>
          </div>
          <div className="rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <span className="text-3xl mb-3 block">📚</span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Smart Study Plans
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              AI generates personalized day-by-day study plans
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-gray-800/50 px-4 sm:px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-10">
            How it works
          </h2>
          <ol className="space-y-6">
            {[
              'Upload your notes or resume',
              'Chat with AI about your content',
              'Practice with mock interviews',
            ].map((step, i) => (
              <li
                key={step}
                className="flex items-start gap-4 rounded-xl bg-white dark:bg-gray-800 p-5 shadow border border-gray-100 dark:border-gray-700"
              >
                <span className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-gray-800 dark:text-gray-200 font-medium pt-2">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <footer className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm border-t border-gray-200 dark:border-gray-700">
        Made with ❤️ by Joyal Quadras
      </footer>
    </div>
  );
};

export default LandingPage;
