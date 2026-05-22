// frontend/src/components/dashboard/HeatmapWidget.jsx
import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { showToast } from '../common/CommonComponents';
import { getErrorMessage } from '../../utils/helpers';

const toDateString = (date) => new Date(date).toISOString().split('T')[0];

const getLast30Days = () => {
  const days = [];
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push({
      dateStr: toDateString(d),
      label: d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    });
  }
  return days;
};

const getScoreForDay = (history, dateStr) => {
  const entries = (history || []).filter(
    (e) => e.date && toDateString(e.date) === dateStr
  );
  if (entries.length === 0) return null;
  const scores = entries
    .map((e) => e.score)
    .filter((s) => s !== undefined && s !== null);
  if (scores.length === 0) return 50;
  return Math.max(...scores);
};

const getIntensityClass = (score) => {
  if (score === null) return 'bg-gray-100 dark:bg-gray-800';
  if (score <= 50) return 'bg-green-200 dark:bg-green-900';
  if (score <= 80) return 'bg-green-400 dark:bg-green-700';
  return 'bg-green-600 dark:bg-green-500';
};

export const HeatmapWidget = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/streak/today');
        setData(response.data.data);
      } catch (error) {
        showToast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const days = useMemo(() => getLast30Days(), []);
  const history = data?.history || [];

  const totalChallenges = history.length;

  if (loading) {
    return (
      <div className="animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700 h-48" />
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Activity (last 30 days)
      </h3>

      <div
        className="grid gap-1 mb-4"
        style={{ gridTemplateColumns: 'repeat(10, minmax(0, 1fr))' }}
      >
        {days.map((day) => {
          const score = getScoreForDay(history, day.dateStr);
          const tooltip =
            score === null
              ? `${day.label}: No activity`
              : `${day.label}: Score ${score}`;

          return (
            <div
              key={day.dateStr}
              className={`aspect-square rounded-sm cursor-default transition-transform hover:scale-110 ${getIntensityClass(score)}`}
              title={tooltip}
              onMouseEnter={() =>
                setHovered({ label: day.label, score, dateStr: day.dateStr })
              }
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
      </div>

      {hovered && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 min-h-[1rem]">
          {hovered.score === null
            ? `${hovered.label} — No activity`
            : `${hovered.label} — Score ${hovered.score}`}
        </p>
      )}

      <p className="text-sm text-gray-700 dark:text-gray-300">
        <span className="mr-4">
          🔥 {data?.currentStreak ?? 0} day streak
        </span>
        <span>📅 {totalChallenges} total challenges</span>
      </p>

      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800" />
        <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900" />
        <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700" />
        <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500" />
        <span>More</span>
      </div>
    </div>
  );
};

export default HeatmapWidget;
