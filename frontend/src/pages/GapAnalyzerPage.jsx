// frontend/src/pages/GapAnalyzerPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { resumeAPI } from '../services/api';
import { CircularProgress } from '../components/common/CircularProgress';
import { Button, showToast } from '../components/common/CommonComponents';
import { getErrorMessage, formatDate } from '../utils/helpers';

const getMatchColor = (score) => {
  if (score < 50) return 'red';
  if (score < 75) return 'yellow';
  return 'green';
};

const SkeletonCard = () => (
  <div className="animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700 h-24" />
);

const EmptyIcon = () => (
  <svg
    className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

export const GapAnalyzerPage = () => {
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState('');
  const [resumeId, setResumeId] = useState('');
  const [resumeOptions, setResumeOptions] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const loadResumes = async () => {
      try {
        const response = await resumeAPI.getAllAnalyses({ limit: 50 });
        const analyses = response.data.data?.analyses || [];
        setResumeOptions(analyses);
      } catch (error) {
        showToast.error(getErrorMessage(error));
      } finally {
        setLoadingResumes(false);
      }
    };
    loadResumes();
  }, []);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      showToast.error('Please paste a job description');
      return;
    }
    setAnalyzing(true);
    setResult(null);
    try {
      const payload = { jobDescription: jobDescription.trim() };
      if (resumeId) payload.resumeId = resumeId;
      const response = await api.post('/gap-analyzer', payload);
      setResult(response.data.data);
      showToast.success('Gap analysis complete');
    } catch (error) {
      showToast.error(getErrorMessage(error));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setJobDescription('');
    setResumeId('');
  };

  const matchScore = Number(result?.matchScore) || 0;

  return (
    <div className="max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Job Description Gap Analyzer
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
          Compare a job posting against your skills and see what to study next
        </p>
      </div>

      {/* Input form */}
      {!result && (
        <div className="space-y-4 mb-6 sm:mb-8">
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            className="w-full min-h-[160px] sm:min-h-[200px] px-3 sm:px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm sm:text-base text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
            disabled={analyzing}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
              Compare with resume analysis (optional)
            </label>
            <select
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
              disabled={loadingResumes || analyzing}
              className="w-full px-3 sm:px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm sm:text-base text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">No resume selected</option>
              {resumeOptions.map((item) => {
                const note = item.resumeNoteId;
                const label = note?.fileName || note?.title || 'Resume';
                const date = item.updatedAt || item.createdAt;
                return (
                  <option key={item._id} value={item._id}>
                    {label} — {formatDate(date)}
                  </option>
                );
              })}
            </select>
          </div>

          <Button
            onClick={handleAnalyze}
            isLoading={analyzing}
            className="w-full !bg-indigo-600 hover:!bg-indigo-700"
          >
            Analyze Gap
          </Button>
        </div>
      )}

      {/* Skeletons */}
      {analyzing && (
        <div className="space-y-4 mb-6 sm:mb-8">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Empty state */}
      {!analyzing && !result && (
        <div className="text-center py-12 sm:py-16 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
          <EmptyIcon />
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Paste a job description to get started
          </p>
        </div>
      )}

      {/* Results */}
      {result && !analyzing && (
        <div className="space-y-5 sm:space-y-8">

          {/* Match score */}
          <div className="flex flex-col items-center py-4 sm:py-6">
            <CircularProgress
              value={matchScore}
              size={110}
              stroke={10}
              color={getMatchColor(matchScore)}
            />
            <p className="mt-3 text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">
              Match Score
            </p>
          </div>

          {/* Matched / Missing skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 bg-white dark:bg-gray-800">
              <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mb-3">
                ✅ Matched Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {(result.matchedSkills || []).length > 0 ? (
                  result.matchedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">None detected</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 bg-white dark:bg-gray-800">
              <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mb-3">
                ❌ Missing Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {(result.missingSkills || []).length > 0 ? (
                  result.missingSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">None detected</p>
                )}
              </div>
            </div>
          </div>

          {/* Priority topics */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              📚 Priority Study Topics
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {(result.priorityTopics || []).map((topic, index) => (
                <div
                  key={topic}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                      {topic}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/notes?search=${encodeURIComponent(topic)}`)}
                    className="self-end sm:self-auto"
                  >
                    Study Now →
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation */}
          <div className="rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
              💡 Recommendation
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {result.recommendation || 'No recommendation provided.'}
            </p>
          </div>

          <Button variant="secondary" className="w-full" onClick={handleReset}>
            Analyze Another
          </Button>
        </div>
      )}
    </div>
  );
};

export default GapAnalyzerPage;