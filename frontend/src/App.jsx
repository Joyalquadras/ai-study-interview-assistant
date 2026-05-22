import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './context/authStore';
import { useThemeStore } from './context/themeStore';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ChatPage } from './pages/ChatPage';
import { ResumePage } from './pages/ResumePage';
import { StudyPlansPage } from './pages/StudyPlansPage';
import { MockInterviewPage } from './pages/MockInterviewPage';
import NoteDetail from './pages/NoteDetail';

import { ProtectedRoute } from './components/common/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { NotesManager } from './components/dashboard/NotesManager';

import './index.css';

const GapAnalyzerPage = lazy(() =>
  import('./pages/GapAnalyzerPage').then((m) => ({ default: m.GapAnalyzerPage }))
);
const StarStoriesPage = lazy(() =>
  import('./pages/StarStoriesPage').then((m) => ({ default: m.StarStoriesPage }))
);
const QuizAnalyticsPage = lazy(() =>
  import('./pages/QuizAnalyticsPage').then((m) => ({ default: m.QuizAnalyticsPage }))
);

const PageLoader = () => (
  <div className="flex items-center justify-center py-24">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
  </div>
);

const LazyPage = ({ children }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

function App() {
  const { initAuth, isAuthenticated } = useAuthStore();
  const { initTheme } = useThemeStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initTheme();
    initAuth().finally(() => setIsInitialized(true));
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <MainLayout>
                <NotesManager />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/notes/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <NoteDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/resume"
          element={
            <ProtectedRoute>
              <ResumePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/study-plans"
          element={
            <ProtectedRoute>
              <StudyPlansPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mock-interview"
          element={
            <ProtectedRoute>
              <MockInterviewPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/gap-analyzer"
          element={
            <ProtectedRoute>
              <MainLayout>
                <LazyPage>
                  <GapAnalyzerPage />
                </LazyPage>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/star-stories"
          element={
            <ProtectedRoute>
              <MainLayout>
                <LazyPage>
                  <StarStoriesPage />
                </LazyPage>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/quiz-analytics"
          element={
            <ProtectedRoute>
              <MainLayout>
                <LazyPage>
                  <QuizAnalyticsPage />
                </LazyPage>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            isAuthenticated ? (
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            ) : (
              <LoginPage />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
