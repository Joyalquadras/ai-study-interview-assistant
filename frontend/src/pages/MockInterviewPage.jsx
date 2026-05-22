import React, { useState, useEffect, useRef, useCallback } from 'react';
import { interviewAPI } from '../services/api';
import { showToast } from '../components/common/CommonComponents';
import { CircularProgress } from '../components/common/CircularProgress';
import { MainLayout } from '../layouts/MainLayout';
import { getErrorMessage } from '../utils/helpers';

const TOTAL_QUESTIONS = 5;

const CATEGORIES = [
  { id: 'hr-questions', label: 'HR', icon: '👔' },
  { id: 'javascript', label: 'JavaScript', icon: 'JS' },
  { id: 'react', label: 'React', icon: '⚛️' },
  { id: 'nodejs', label: 'Node.js', icon: '🟢' },
  { id: 'mongodb', label: 'MongoDB', icon: '🍃' },
  { id: 'dsa', label: 'DSA', icon: '🧮' },
  { id: 'blockchain', label: 'Blockchain', icon: '⛓️' },
];

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', api: 'easy' },
  { id: 'medium', label: 'Medium', api: 'medium' },
  { id: 'hard', label: 'Hard', api: 'hard' },
];

const CATEGORY_LABELS = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.label])
);

const DIFFICULTY_LABELS = {
  beginner: 'Easy',
  intermediate: 'Medium',
  advanced: 'Hard',
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

const normalizeScore = (score) => {
  const n = Number(score);
  if (Number.isNaN(n)) return 0;
  if (n > 10) return Math.round(n / 10);
  return n;
};

const getScoreColorClass = (score) => {
  const s = normalizeScore(score);
  if (s < 5) return 'bg-red-100 text-red-700';
  if (s <= 7) return 'bg-yellow-100 text-yellow-800';
  return 'bg-green-100 text-green-700';
};

const formatTimer = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const RobotAvatar = () => (
  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xl">
    🤖
  </div>
);

const TabSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((n) => (
      <div key={n} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-24" />
    ))}
  </div>
);

export const MockInterviewPage = () => {
  const [step, setStep] = useState('setup');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [interview, setInterview] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [lastFeedback, setLastFeedback] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [responses, setResponses] = useState([]);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [finalReport, setFinalReport] = useState(null);
  const [openAccordion, setOpenAccordion] = useState(0);

  const autoAdvanceRef = useRef(null);

  const resetAll = () => {
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    setStep('setup');
    setCategory('');
    setDifficulty('medium');
    setInterview(null);
    setCurrentIndex(0);
    setAnswer('');
    setLastFeedback(null);
    setShowFeedback(false);
    setResponses([]);
    setTimerSeconds(0);
    setFinalReport(null);
    setOpenAccordion(0);
  };

  const handleStart = async () => {
    if (!category) {
      showToast.error('Please select a category');
      return;
    }

    try {
      setIsStarting(true);
      const res = await interviewAPI.start({ category, difficulty });
      const data = res.data.data.interview;
      setInterview(data);
      setCurrentIndex(0);
      setResponses([]);
      setAnswer('');
      setLastFeedback(null);
      setShowFeedback(false);
      setTimerSeconds(0);
      setStep('interview');
    } catch (error) {
      showToast.error(getErrorMessage(error) || 'Failed to start interview');
    } finally {
      setIsStarting(false);
    }
  };

  const finishInterview = useCallback(async (interviewId) => {
    try {
      setIsEnding(true);
      setStep('results');
      const res = await interviewAPI.end({ interviewId });
      setFinalReport(res.data.data.interview);
    } catch (error) {
      showToast.error(getErrorMessage(error) || 'Failed to generate report');
    } finally {
      setIsEnding(false);
    }
  }, []);

  const goToNextQuestion = useCallback(() => {
    setShowFeedback(false);
    setLastFeedback(null);
    setAnswer('');
    setCurrentIndex((i) => i + 1);
  }, []);

  useEffect(() => {
    if (step !== 'interview') return undefined;

    const interval = setInterval(() => {
      setTimerSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  useEffect(() => {
    if (!showFeedback || !lastFeedback) return undefined;

    autoAdvanceRef.current = setTimeout(() => {
      if (lastFeedback.isComplete) {
        finishInterview(interview._id);
      } else {
        goToNextQuestion();
      }
    }, 2000);

    return () => {
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    };
  }, [showFeedback, lastFeedback, interview, finishInterview, goToNextQuestion]);

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || isSubmitting || showFeedback) return;

    try {
      setIsSubmitting(true);
      const res = await interviewAPI.respond({
        interviewId: interview._id,
        answer: answer.trim(),
      });

      const { evaluation, isComplete } = res.data.data;
      const currentQ = interview.questions[currentIndex];

      const responseEntry = {
        question: currentQ?.question,
        userResponse: answer.trim(),
        evaluation,
      };

      setResponses((prev) => [...prev, responseEntry]);
      setLastFeedback({ ...evaluation, isComplete });
      setShowFeedback(true);
    } catch (error) {
      showToast.error(getErrorMessage(error) || 'Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    if (lastFeedback?.isComplete) {
      finishInterview(interview._id);
    } else {
      goToNextQuestion();
    }
  };

  const currentQuestion = interview?.questions?.[currentIndex];
  const progressPercent = interview
    ? ((currentIndex + 1) / TOTAL_QUESTIONS) * 100
    : 0;

  const report = finalReport;
  const overallScore = normalizeScore(report?.overallScore);
  const progressScore = Math.min(100, Math.max(0, overallScore * 10));

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Step 1 — Setup */}
        {step === 'setup' && (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center">
              AI Mock Interview
            </h1>

            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Category
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      category === cat.id
                        ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-indigo-300'
                    }`}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Difficulty
              </p>
              <div className="flex gap-3">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDifficulty(d.api)}
                    className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${
                      difficulty === d.api
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleStart}
              disabled={isStarting || !category}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl disabled:opacity-50 transition-colors"
            >
              {isStarting ? 'Starting...' : 'Start Interview'}
            </button>
          </div>
        )}

        {/* Step 2 — Interview */}
        {step === 'interview' && interview && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex gap-2">
                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                  {CATEGORY_LABELS[interview.category] || interview.category}
                </span>
                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {DIFFICULTY_LABELS[interview.difficulty] || interview.difficulty}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Question {Math.min(currentIndex + 1, TOTAL_QUESTIONS)}/{TOTAL_QUESTIONS}
              </p>
              <p className="text-sm font-mono text-gray-600 dark:text-gray-400 tabular-nums">
                {formatTimer(timerSeconds)}
              </p>
            </div>

            <div className="flex gap-4">
              <RobotAvatar />
              <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                <p className="text-lg text-gray-900 dark:text-gray-100 leading-relaxed">
                  {currentQuestion?.question}
                </p>
              </div>
            </div>

            {!showFeedback && (
              <div className="space-y-2">
                <div className="relative">
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    disabled={isSubmitting}
                    className="w-full min-h-[150px] px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 resize-y"
                  />
                  <span className="absolute bottom-3 right-3 text-xs text-gray-400">
                    {answer.length} chars
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSubmitAnswer}
                  disabled={isSubmitting || !answer.trim()}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? 'Evaluating...' : 'Submit Answer'}
                </button>
              </div>
            )}

            {showFeedback && lastFeedback && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-3">
                <span
                  className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getScoreColorClass(
                    lastFeedback.score
                  )}`}
                >
                  Score: {normalizeScore(lastFeedback.score)}/10
                </span>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {lastFeedback.feedback}
                </p>
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                >
                  {lastFeedback.isComplete ? 'View Results' : 'Next Question'}
                </button>
              </div>
            )}

            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Step 3 — Results */}
        {step === 'results' && (
          <div className="space-y-8">
            {isEnding && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Generating your report...
                </p>
              </div>
            )}

            {!isEnding && report && (
              <>
                <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
                  Interview Complete
                </h2>

                <div className="flex flex-col items-center gap-2">
                  <CircularProgress
                    progress={progressScore}
                    size={140}
                    stroke={12}
                    color={
                      overallScore < 5
                        ? 'red'
                        : overallScore <= 7
                          ? 'yellow'
                          : 'green'
                    }
                  />
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    Overall: {overallScore}/10
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5">
                    <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                      ✓ Strengths
                    </h3>
                    <ul className="space-y-2">
                      {(report.strengths || []).map((s, i) => (
                        <li
                          key={i}
                          className="text-sm text-green-800 dark:text-green-200 flex gap-2"
                        >
                          <span className="text-green-600">✓</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-5">
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-3 flex items-center gap-2">
                      ⚠ Improvements
                    </h3>
                    <ul className="space-y-2">
                      {(report.improvements || []).map((s, i) => (
                        <li
                          key={i}
                          className="text-sm text-yellow-800 dark:text-yellow-200 flex gap-2"
                        >
                          <span>⚠</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Full Q&amp;A
                  </h3>
                  {(report.responses || responses).map((item, idx) => {
                    const evalData =
                      item.aiEvaluation || item.evaluation || {};
                    const score = normalizeScore(evalData.score);
                    return (
                      <div
                        key={idx}
                        className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setOpenAccordion(openAccordion === idx ? -1 : idx)
                          }
                          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 text-left"
                        >
                          <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                            Q{idx + 1}: {(item.question || '').slice(0, 60)}
                            {(item.question || '').length > 60 ? '…' : ''}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${getScoreColorClass(score)}`}
                          >
                            {score}/10
                          </span>
                        </button>
                        {openAccordion === idx && (
                          <div className="px-4 py-4 space-y-3 text-sm border-t border-gray-200 dark:border-gray-700">
                            <div>
                              <p className="font-semibold text-gray-500 dark:text-gray-400 mb-1">
                                Question
                              </p>
                              <p className="text-gray-900 dark:text-gray-100">
                                {item.question}
                              </p>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-500 dark:text-gray-400 mb-1">
                                Your Answer
                              </p>
                              <p className="text-gray-800 dark:text-gray-200">
                                {item.userResponse}
                              </p>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-500 dark:text-gray-400 mb-1">
                                AI Feedback
                              </p>
                              <p className="text-gray-800 dark:text-gray-200">
                                {evalData.feedback}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={resetAll}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
                >
                  Start New Interview
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MockInterviewPage;
