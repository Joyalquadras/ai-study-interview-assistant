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
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">Mock Interviews</h1>
        <Card>
          {isLoading ? (
            <p>Loading interviews...</p>
          ) : interviews.length === 0 ? (
            <p className="text-gray-500">No mock interviews yet</p>
          ) : (
            <div className="space-y-3">
              {interviews.map((i) => (
                <div key={i._id} className="p-3 border rounded-lg">
                  <h3 className="font-semibold">{i.title}</h3>
                  <p className="text-sm text-gray-500">{i.category} • {i.status}</p>
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
