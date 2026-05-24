import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../context/authStore';
import { Card, Button, showToast } from '../components/common/CommonComponents';
import { StreakWidget } from '../components/dashboard/StreakWidget';
import { HeatmapWidget } from '../components/dashboard/HeatmapWidget';
import { notesAPI } from '../services/api';
import { getTimeAgo } from '../utils/helpers';

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalChats: 0,
    totalPlans: 0,
    recentActivity: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.isGuest) {
      setIsLoading(false);
      return;
    }
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const notesResponse = await notesAPI.getNotes({ limit: 5 });
      setStats({
        totalNotes: notesResponse.data.data.pagination.totalItems,
        totalChats: 0,
        totalPlans: 0,
        recentActivity: notesResponse.data.data.notes,
      });
    } catch (error) {
      showToast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Heading */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Here&apos;s what&apos;s happening with your study today
        </p>
      </div>

      {/* Widgets */}
      <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
        <StreakWidget />
        <HeatmapWidget />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
        <Card>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 mb-1 md:mb-2">
              {stats.totalNotes}
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Notes Uploaded</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600 mb-1 md:mb-2">
              {stats.totalChats}
            </div>
            <p className="text-xs sm:text-sm text-gray-600">AI Conversations</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600 mb-1 md:mb-2">
              {stats.totalPlans}
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Study Plans</p>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <Link to="/notes">
          <Button className="w-full text-sm sm:text-base" variant="primary">📝 Upload Notes</Button>
        </Link>
        <Link to="/chat">
          <Button className="w-full text-sm sm:text-base" variant="primary">💬 Start Chat</Button>
        </Link>
        <Link to="/gap-analyzer">
          <Button className="w-full text-sm sm:text-base" variant="primary">🔍 Gap Analyzer</Button>
        </Link>
        <Link to="/mock-interview">
          <Button className="w-full text-sm sm:text-base" variant="primary">🎯 Mock Interview</Button>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card>
        <h2 className="text-lg sm:text-xl font-bold mb-4">Recent Notes</h2>

        {user?.isGuest ? (
          <div className="text-center py-6">
            <p className="text-sm sm:text-base text-gray-500 mb-3">
              You're in guest mode. Register to save notes and track progress.
            </p>
            <Link to="/register">
              <Button variant="primary">Register Free</Button>
            </Link>
          </div>
        ) : isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : stats.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {stats.recentActivity.map((note) => (
              <div
                key={note._id}
                className="flex items-center justify-between gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{note.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {getTimeAgo(note.createdAt)} • {note.fileType.toUpperCase()}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="shrink-0">View</Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm sm:text-base text-gray-500">No notes yet. Upload your first note to get started!</p>
        )}
      </Card>
    </div>
  );
};