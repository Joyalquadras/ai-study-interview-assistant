// frontend/src/components/common/MCQQuiz.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Button } from './CommonComponents';
import { getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';

const CONFIDENCE_LEVELS = [
  { value: 1, emoji: '😰' },
  { value: 2, emoji: '😐' },
  { value: 3, emoji: '🙂' },
  { value: 4, emoji: '😊' },
  { value: 5, emoji: '💪' },
];

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const getResultFeedback = (confidence, isCorrect) => {
  if (confidence >= 4 && !isCorrect) {
    return {
      borderClass: 'border-red-500 ring-2 ring-red-200 dark:ring-red-900',
      message: '⚠️ Overconfidence detected — review this topic',
    };
  }
  if (confidence <= 2 && isCorrect) {
    return {
      borderClass: 'border-green-500 ring-2 ring-green-200 dark:ring-green-900',
      message: '🎯 Trust yourself! You knew this.',
    };
  }
  if (confidence >= 4 && isCorrect) {
    return {
      borderClass: 'border-green-500 ring-2 ring-green-200 dark:ring-green-900',
      message: '✅ Excellent! Confidence well placed.',
    };
  }
  if (confidence <= 2 && !isCorrect) {
    return {
      borderClass: 'border-yellow-500 ring-2 ring-yellow-200 dark:ring-yellow-900',
      message: '📚 Keep studying — you sensed the uncertainty.',
    };
  }
  if (isCorrect) {
    return {
      borderClass: 'border-green-400 dark:border-green-600',
      message: '✅ Correct!',
    };
  }
  return {
    borderClass: 'border-yellow-400 dark:border-yellow-600',
    message: 'Incorrect — review the explanation below.',
  };
};

export const MCQQuiz = ({ questions: questionsProp, mcqs, noteId = null }) => {
  const navigate = useNavigate();
  const questions = questionsProp?.length ? questionsProp : mcqs || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [overconfidentCount, setOverconfidentCount] = useState(0);
  const [underestimatedCount, setUnderestimatedCount] = useState(0);
  const [showFinalResults, setShowFinalResults] = useState(false);

  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setConfidence(null);
    setSubmitted(false);
    setSubmitting(false);
    setScore({ correct: 0, total: 0 });
    setOverconfidentCount(0);
    setUnderestimatedCount(0);
    setShowFinalResults(false);
  };

  if (!questions.length) {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
        No quiz questions available.
      </p>
    );
  }

  if (showFinalResults) {
    return (
      <div className="max-w-xl mx-auto space-y-6 p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
          Quiz Complete
        </h3>
        <p className="text-center text-3xl font-bold text-indigo-600 dark:text-indigo-400">
          {score.correct} / {score.total} correct
        </p>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 p-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <p>Confidence insights:</p>
          <p>• You were overconfident {overconfidentCount} times</p>
          <p>• You underestimated yourself {underestimatedCount} times</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            className="flex-1 !bg-indigo-600 hover:!bg-indigo-700"
            onClick={() => navigate('/quiz-analytics')}
          >
            View Analytics →
          </Button>
          <Button variant="secondary" className="flex-1" onClick={resetQuiz}>
            Retry Quiz
          </Button>
        </div>
      </div>
    );
  }

  const question = questions[currentIndex];
  const isCorrect =
    submitted && selectedAnswer !== null && selectedAnswer === question.answer;
  const feedback =
    submitted && confidence !== null
      ? getResultFeedback(confidence, isCorrect)
      : null;

  const handleSelectConfidence = (level) => {
    if (submitted) return;
    setConfidence(level);
  };

  const handleSelectAnswer = async (option) => {
    if (!confidence || submitted || submitting) return;

    setSelectedAnswer(option);
    setSubmitting(true);

    const correct = option === question.answer;

    try {
      await api.post('/quiz/submit-answer', {
        questionId: currentIndex.toString(),
        selectedAnswer: option,
        correctAnswer: question.answer,
        confidence,
        noteId,
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }

    setSubmitted(true);
    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));

    if (confidence >= 4 && !correct) {
      setOverconfidentCount((n) => n + 1);
    }
    if (confidence <= 2 && correct) {
      setUnderestimatedCount((n) => n + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex >= questions.length - 1) {
      setShowFinalResults(true);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelectedAnswer(null);
    setConfidence(null);
    setSubmitted(false);
  };

  const getOptionClass = (option) => {
    const base =
      'w-full text-left p-4 rounded-lg border-2 transition-all disabled:opacity-60 ' +
      'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ' +
      'border-gray-200 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500';

    if (!submitted) {
      return base;
    }

    const isSelected = selectedAnswer === option;
    const isAnswer = option === question.answer;

    if (isSelected && feedback) {
      return `${base} ${feedback.borderClass}`;
    }
    if (isAnswer && !isSelected) {
      return `${base} border-green-300 dark:border-green-700 opacity-80`;
    }
    return `${base} opacity-50`;
  };

  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span>
          Score: {score.correct} / {score.total}
        </span>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
        <p className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          {question.question}
        </p>

        {!submitted && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Before you answer — how confident are you?
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {CONFIDENCE_LEVELS.map(({ value, emoji }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleSelectConfidence(value)}
                  className={`rounded-full px-4 py-2 border text-lg transition-all ${
                    confidence === value
                      ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900 border-indigo-400 dark:border-indigo-600'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  aria-label={`Confidence level ${value}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {confidence !== null && !submitted && (
          <div className="space-y-2">
            {(question.options || []).slice(0, 4).map((option, idx) => (
              <button
                key={idx}
                type="button"
                disabled={submitting}
                onClick={() => handleSelectAnswer(option)}
                className={getOptionClass(option)}
              >
                <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-2">
                  {OPTION_LABELS[idx]}.
                </span>
                {option}
              </button>
            ))}
          </div>
        )}

        {submitted && (
          <div className="space-y-4">
            <div className="space-y-2">
              {(question.options || []).slice(0, 4).map((option, idx) => (
                <div key={idx} className={getOptionClass(option)}>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-2">
                    {OPTION_LABELS[idx]}.
                  </span>
                  {option}
                </div>
              ))}
            </div>

            {feedback && (
              <p
                className={`text-sm font-medium p-3 rounded-lg ${
                  feedback.borderClass.includes('red')
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                    : feedback.borderClass.includes('yellow')
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
                      : 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                }`}
              >
                {feedback.message}
              </p>
            )}

            {question.explanation && (
              <p className="text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
                {question.explanation}
              </p>
            )}

            <Button
              className="w-full !bg-indigo-600 hover:!bg-indigo-700"
              onClick={handleNext}
            >
              {isLastQuestion ? 'See Results' : 'Next Question →'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MCQQuiz;
