// frontend/src/pages/QuizAnalyticsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import api from '../services/api';
import { Button, showToast } from '../components/common/CommonComponents';
import { getErrorMessage } from '../utils/helpers';

const CONFIDENCE_EMOJI = {
  1: '😰',
  2: '😐',
  3: '🙂',
  4: '😊',
  5: '💪',
};

const getBarColor = (percentage) => {
  if (percentage < 50) return '#dc2626';
  if (percentage < 75) return '#d97706';
  return '#16a34a';
};

const StatSkeleton = () => (
  <div className="animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700 h-28" />
);

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 shadow-lg text-sm">
      <p className="text-gray-900 dark:text-gray-100">
        {item.correct} correct out of {item.total} attempts
      </p>
    </div>
  );
};

export const QuizAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/quiz/analytics');
        setAnalytics(response.data.data);
      } catch (error) {
        showToast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const chartData = useMemo(() => {
    if (!analytics?.accuracyByConfidence) return [];
    return analytics.accuracyByConfidence.map((row) => ({
      ...row,
      label: `${CONFIDENCE_EMOJI[row.confidence]} ${row.confidence}`,
    }));
  }, [analytics]);

  const overallAccuracy = useMemo(() => {
    if (!analytics?.accuracyByConfidence) return 0;
    const totals = analytics.accuracyByConfidence.reduce(
      (acc, row) => ({
        correct: acc.correct + row.correct,
        total: acc.total + row.total,
      }),
      { correct: 0, total: 0 }
    );
    return totals.total > 0
      ? Math.round((totals.correct / totals.total) * 100)
      : 0;
  }, [analytics]);

  const isEmpty = !loading && (analytics?.totalAttempts || 0) === 0;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Quiz Intelligence Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Understand your confidence vs accuracy patterns
        </p>
      </div>

      {loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </div>
          <div className="animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700 h-80" />
        </div>
      )}

      {isEmpty && (
        <div className="text-center py-16 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Complete some MCQ quizzes to see your analytics
          </p>
          <Link to="/notes">
            <Button variant="primary">Go to Notes</Button>
          </Link>
        </div>
      )}

      {!loading && !isEmpty && analytics && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {analytics.totalAttempts}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Total Attempts
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 text-center">
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {overallAccuracy}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Overall Accuracy
              </p>
            </div>
            <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-5 text-center">
              <p className="text-3xl font-bold text-red-700 dark:text-red-300">
                {analytics.highConfidenceWrong}
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                ⚠️ Overconfident
              </p>
            </div>
            <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-5 text-center">
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                {analytics.lowConfidenceRight}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                🎯 Underestimated
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Accuracy by Confidence Level
            </h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <XAxis
                    dataKey="label"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.confidence}
                        fill={getBarColor(entry.percentage)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-6">
              <h3 className="font-bold text-red-800 dark:text-red-200 mb-2">
                ⚠️ Watch Out — Overconfidence
              </h3>
              <p className="text-red-700 dark:text-red-300 text-sm leading-relaxed">
                You answered {analytics.highConfidenceWrong} questions wrong while
                feeling confident. Focus on reviewing these topics carefully.
              </p>
            </div>
            <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-6">
              <h3 className="font-bold text-green-800 dark:text-green-200 mb-2">
                🎯 Hidden Strength — Underestimated
              </h3>
              <p className="text-green-700 dark:text-green-300 text-sm leading-relaxed">
                You got {analytics.lowConfidenceRight} questions right while feeling
                unsure. Trust your knowledge more in these areas!
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default QuizAnalyticsPage;
