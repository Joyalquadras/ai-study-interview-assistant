import React, { useState, useEffect } from 'react';
import { interviewAPI } from '../services/api';
import { Card, Button, showToast } from '../components/common/CommonComponents';
import { MainLayout } from '../layouts/MainLayout';

export const InterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      setIsLoading(true);
      const res = await interviewAPI.getInterviews({ limit: 50 });
      setInterviews(res.data.data.interviews || []);
    } catch (err) {
      showToast.error('Failed to load interviews');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          Mock Interviews
        </h1>
        <Card>
          {isLoading ? (
            <p className="text-sm sm:text-base text-gray-500">Loading interviews...</p>
          ) : interviews.length === 0 ? (
            <p className="text-sm sm:text-base text-gray-500">No mock interviews yet</p>
          ) : (
            <div className="space-y-3">
              {interviews.map((i) => (
                <div
                  key={i._id}
                  className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                    {i.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    {i.category} • {i.status}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};

export default InterviewsPage;