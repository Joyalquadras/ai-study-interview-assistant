// frontend/src/components/dashboard/StreakWidget.jsx
import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { Button, showToast } from '../common/CommonComponents';
import { getErrorMessage } from '../../utils/helpers';

const TYPE_LABELS = {
  mcq: 'MCQ',
  flashcard: 'Flashcard',
  mock_question: 'Mock',
  summary: 'Summary',
};

const toDateString = (date) => new Date(date).toISOString().split('T')[0];

const getWeekDates = () => {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(12, 0, 0, 0);

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(toDateString(d));
  }
  return dates;
};

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const StreakWidget = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchStreak = async () => {
    try {
      const response = await api.get('/streak/today');
      setData(response.data.data);
    } catch (error) {
      showToast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreak();
  }, []);

  const completedDates = useMemo(() => {
    const set = new Set();
    (data?.history || []).forEach((entry) => {
      if (entry.date) set.add(toDateString(entry.date));
    });
    return set;
  }, [data?.history]);

  const weekDates = useMemo(() => getWeekDates(), []);

  const handleSubmit = async () => {
    if (!data?.todayChallenge?.type) return;

    setSubmitting(true);
    try {
      await api.post('/streak/complete', {
        challengeType: data.todayChallenge.type,
        score: 100,
      });
      showToast.success('🔥 Streak updated!');
      setModalOpen(false);
      setAnswer('');
      setLoading(true);
      await fetchStreak();
    } catch (error) {
      showToast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700 h-64" />
    );
  }

  const challenge = data?.todayChallenge;
  const typeLabel = TYPE_LABELS[challenge?.type] || challenge?.type || 'Challenge';
  const truncated =
    challenge?.question?.length > 100
      ? `${challenge.question.slice(0, 100)}...`
      : challenge?.question || '';

  return (
    <>
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl" role="img" aria-label="flame">
            🔥
          </span>
          <div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {data?.currentStreak ?? 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">day streak</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Current: {data?.currentStreak ?? 0} · Best: {data?.longestStreak ?? 0}
        </p>

        <div className="rounded-lg bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 p-4 mb-4">
          <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-indigo-600 text-white mb-2">
            {typeLabel}
          </span>
          <p className="text-sm text-gray-800 dark:text-gray-200">{truncated}</p>
          <Button
            size="sm"
            className="mt-3 !bg-indigo-600 hover:!bg-indigo-700"
            onClick={() => setModalOpen(true)}
            disabled={data?.hasCompleted}
          >
            {data?.hasCompleted ? 'Completed today ✓' : 'Start Challenge →'}
          </Button>
        </div>

        <div className="flex justify-between gap-1">
          {weekDates.map((dateStr, i) => {
            const filled = completedDates.has(dateStr);
            return (
              <div key={dateStr} className="flex flex-col items-center flex-1">
                <div
                  className={`w-full aspect-square max-w-[2rem] rounded ${
                    filled
                      ? 'bg-indigo-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                  title={dateStr}
                />
                <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                  {DAY_LABELS[i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Today&apos;s {typeLabel} Challenge
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
              {challenge?.question}
            </p>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Write your answer here..."
              className="w-full min-h-[120px] px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 mb-4"
            />
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                isLoading={submitting}
                className="!bg-indigo-600 hover:!bg-indigo-700"
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StreakWidget;
