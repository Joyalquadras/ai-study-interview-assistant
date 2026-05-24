import React, { useState, useEffect, useRef } from 'react';
import { studyPlanAPI } from '../services/api';
import { showToast } from '../components/common/CommonComponents';
import { MainLayout } from '../layouts/MainLayout';
import { formatDate, getErrorMessage } from '../utils/helpers';

const MIN_HOURS = 1;
const MAX_HOURS = 12;

const getTomorrowString = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const formatDayHeader = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const ExternalLinkIcon = () => (
  <svg className="w-3 h-3 inline-block ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const PlanSkeleton = () => (
  <div className="space-y-3 animate-pulse">
    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
  </div>
);

const DayCard = ({ day, dayIndex }) => (
  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5 shadow-sm">
    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
      Day {day.dayNumber ?? dayIndex + 1} — {formatDayHeader(day.date)}
    </h3>
    <ul className="space-y-3 sm:space-y-4">
      {(day.tasks || []).map((task, taskIdx) => (
        <li
          key={taskIdx}
          className="border-t border-gray-100 dark:border-gray-800 pt-3 sm:pt-4 first:border-t-0 first:pt-0"
        >
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
              {task.topic}
            </span>
            {task.duration && (
              <span className="px-2 py-0.5 text-xs rounded-md bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                {task.duration}
              </span>
            )}
          </div>
          {task.description && (
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {task.description}
            </p>
          )}
          {task.resources?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2 sm:gap-3">
              {task.resources.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
                >
                  {url.replace(/^https?:\/\//, '').slice(0, 30)}
                  {url.length > 30 ? '…' : ''}
                  <ExternalLinkIcon />
                </a>
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  </div>
);

export const StudyPlansPage = () => {
  const [goal, setGoal] = useState('');
  const [topics, setTopics] = useState([]);
  const [topicInput, setTopicInput] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [targetDate, setTargetDate] = useState('');
  const [previousPlans, setPreviousPlans] = useState([]);
  const [displayedPlan, setDisplayedPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [viewingPlanId, setViewingPlanId] = useState(null);
  const [mobileView, setMobileView] = useState('form');

  const topicInputRef = useRef(null);
  const planRef = useRef(null);
  const minDate = getTomorrowString();

  useEffect(() => { loadPreviousPlans(); }, []);

  useEffect(() => {
    if (displayedPlan?.schedule?.length) setMobileView('plan');
  }, [displayedPlan]);

  const loadPreviousPlans = async () => {
    try {
      setIsLoadingPlans(true);
      const res = await studyPlanAPI.getMyPlans();
      setPreviousPlans(res.data.data.plans || []);
    } catch (error) {
      showToast.error(getErrorMessage(error) || 'Failed to load previous plans');
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const addTopic = (raw) => {
    const value = raw.trim().replace(/,$/, '');
    if (!value) return;
    if (!topics.includes(value)) setTopics((prev) => [...prev, value]);
    setTopicInput('');
  };

  const handleTopicKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTopic(topicInput);
    } else if (e.key === 'Backspace' && !topicInput && topics.length > 0) {
      setTopics((prev) => prev.slice(0, -1));
    }
  };

  const removeTopic = (topic) => setTopics((prev) => prev.filter((t) => t !== topic));

  const adjustHours = (delta) => {
    setHoursPerDay((prev) => Math.min(MAX_HOURS, Math.max(MIN_HOURS, prev + delta)));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!goal.trim()) return showToast.error('Please enter a goal');
    if (topics.length === 0) return showToast.error('Add at least one topic');
    if (!targetDate) return showToast.error('Please select a target date');

    try {
      setIsGenerating(true);
      setDisplayedPlan(null);
      const res = await studyPlanAPI.generatePlan({ goal: goal.trim(), topics, hoursPerDay, targetDate });
      const plan = res.data.data.plan;
      setDisplayedPlan(plan);
      setPreviousPlans((prev) => [
        { _id: plan._id, goal: plan.goal, createdAt: plan.createdAt, schedule: plan.schedule },
        ...prev.filter((p) => p._id !== plan._id),
      ]);
      showToast.success('Study plan generated');
    } catch (error) {
      showToast.error(getErrorMessage(error) || 'Failed to generate plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewPlan = async (planItem) => {
    if (planItem.schedule?.length) {
      setDisplayedPlan(planItem);
      setViewingPlanId(planItem._id);
      setMobileView('plan');
      return;
    }
    try {
      setViewingPlanId(planItem._id);
      setIsGenerating(true);
      setDisplayedPlan(null);
      const res = await studyPlanAPI.getPlan(planItem._id);
      setDisplayedPlan(res.data.data.plan);
      setMobileView('plan');
    } catch (error) {
      showToast.error(getErrorMessage(error) || 'Failed to load plan');
    } finally {
      setIsGenerating(false);
      setViewingPlanId(null);
    }
  };

  const schedule = displayedPlan?.schedule || [];
  const showPlan = schedule.length > 0;
  const showSkeletons = isGenerating && !showPlan;
  const showEmpty = !isGenerating && !showPlan;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Study Plans
        </h1>

        {/* Mobile tab switcher */}
        <div className="flex lg:hidden border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setMobileView('form')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              mobileView === 'form'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400'
            }`}
          >
            Create Plan
          </button>
          <button
            type="button"
            onClick={() => setMobileView('plan')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              mobileView === 'plan'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400'
            }`}
          >
            Generated Plan {showPlan && `(${schedule.length} days)`}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">

          {/* Left — Create form */}
          <div className={`space-y-6 sm:space-y-8 ${mobileView === 'plan' ? 'hidden lg:block' : 'block'}`}>
            <form
              onSubmit={handleGenerate}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 shadow-sm space-y-4 sm:space-y-5"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                Create Study Plan
              </h2>

              <div>
                <label htmlFor="goal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Goal
                </label>
                <input
                  id="goal"
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Crack FAANG interview in 3 months"
                  disabled={isGenerating}
                  className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label htmlFor="topics" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Topics
                </label>
                <div
                  className="flex flex-wrap gap-2 p-2 min-h-[44px] border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-blue-500"
                  onClick={() => topicInputRef.current?.focus()}
                >
                  {topics.map((topic) => (
                    <span
                      key={topic}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs sm:text-sm rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200"
                    >
                      {topic}
                      <button
                        type="button"
                        onClick={() => removeTopic(topic)}
                        disabled={isGenerating}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-300 dark:hover:text-white disabled:opacity-50"
                        aria-label={`Remove ${topic}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    ref={topicInputRef}
                    id="topics"
                    type="text"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    onKeyDown={handleTopicKeyDown}
                    onBlur={() => topicInput && addTopic(topicInput)}
                    placeholder={topics.length === 0 ? 'Type a topic, press Enter' : ''}
                    disabled={isGenerating}
                    className="flex-1 min-w-[100px] outline-none bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Hours per day
                </label>
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => adjustHours(-1)}
                    disabled={isGenerating || hoursPerDay <= MIN_HOURS}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-gray-300 dark:border-gray-600 text-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40"
                    aria-label="Decrease hours"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={MIN_HOURS}
                    max={MAX_HOURS}
                    value={hoursPerDay}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!Number.isNaN(v)) setHoursPerDay(Math.min(MAX_HOURS, Math.max(MIN_HOURS, v)));
                    }}
                    disabled={isGenerating}
                    className="w-14 sm:w-16 text-center px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => adjustHours(1)}
                    disabled={isGenerating || hoursPerDay >= MAX_HOURS}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-gray-300 dark:border-gray-600 text-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40"
                    aria-label="Increase hours"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-500 dark:text-gray-400">hours</span>
                </div>
              </div>

              <div>
                <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target date
                </label>
                <input
                  id="targetDate"
                  type="date"
                  min={minDate}
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  disabled={isGenerating}
                  className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? (
                  <>
                    <span className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Plan'
                )}
              </button>
            </form>

            {/* Previous Plans */}
            <section>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Previous Plans
              </h2>
              {isLoadingPlans ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : previousPlans.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No saved plans yet</p>
              ) : (
                <ul className="space-y-2">
                  {previousPlans.map((plan) => (
                    <li
                      key={plan._id}
                      className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {plan.goal}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(plan.createdAt)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleViewPlan(plan)}
                        disabled={viewingPlanId === plan._id && isGenerating}
                        className="flex-shrink-0 px-3 py-1.5 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50"
                      >
                        View
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Right — Generated plan */}
          <div
            ref={planRef}
            className={`lg:sticky lg:top-8 ${mobileView === 'form' ? 'hidden lg:block' : 'block'}`}
          >
            <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 min-h-[300px] sm:min-h-[400px]">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
                Generated Plan
              </h2>

              {showSkeletons && (
                <div className="space-y-4 sm:space-y-6">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5">
                      <PlanSkeleton />
                    </div>
                  ))}
                </div>
              )}

              {showEmpty && (
                <div className="flex items-center justify-center h-48 sm:h-64">
                  <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 text-center">
                    Your generated plan will appear here
                  </p>
                </div>
              )}

              {showPlan && (
                <div className="space-y-3 sm:space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto pr-1">
                  {schedule.map((day, idx) => (
                    <DayCard key={day.dayNumber ?? idx} day={day} dayIndex={idx} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default StudyPlansPage;