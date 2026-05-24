import React, { useState } from 'react';
import { resumeAPI, notesAPI } from '../services/api';
import { showToast } from '../components/common/CommonComponents';
import DropZone from '../components/common/DropZone';
import { CircularProgress } from '../components/common/CircularProgress';
import { MainLayout } from '../layouts/MainLayout';
import { getErrorMessage } from '../utils/helpers';

const getAtsColor = (score) => {
  if (score < 50) return 'red';
  if (score < 75) return 'yellow';
  return 'green';
};

const normalizeAnalysis = (raw) => {
  if (!raw) return null;

  const detectedSkills = [
    ...(raw.detectedSkills || []),
    ...(raw.skills?.technical || []),
    ...(raw.skills?.soft || []),
  ];

  const missingKeywords =
    raw.missingKeywords || raw.keywords?.missing || raw.recommendedKeywords || [];

  const weaknesses = raw.weaknesses || raw.areasForImprovement || [];

  let improvementSuggestions = raw.improvementSuggestions || [];
  if (!improvementSuggestions.length && raw.improvements?.length) {
    improvementSuggestions = raw.improvements.map((item) =>
      typeof item === 'string' ? item : item.description || item.title
    );
  }
  if (!improvementSuggestions.length && raw.formattingSuggestions?.length) {
    improvementSuggestions = raw.formattingSuggestions;
  }

  return {
    ...raw,
    atsScore: Number(raw.atsScore) || 0,
    detectedSkills: [...new Set(detectedSkills.filter(Boolean))],
    strengths: raw.strengths || [],
    weaknesses: weaknesses.filter(Boolean),
    missingKeywords: [...new Set(missingKeywords.filter(Boolean))],
    improvementSuggestions: improvementSuggestions.filter(Boolean),
    overallFeedback: raw.overallFeedback || '',
  };
};

const CheckIcon = () => (
  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

export const ResumePage = () => {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const runAnalysis = async (noteId) => {
    const response = await resumeAPI.analyze({ noteId });
    setAnalysis(normalizeAnalysis(response.data.data.analysis));
    showToast.success('Resume analyzed successfully!');
  };

  const handleFileSelected = async (file, errMsg) => {
    if (errMsg) return showToast.error(errMsg);
    if (!file) return;

    const form = new FormData();
    form.append('file', file, file.name);
    form.append('category', 'resume');

    try {
      setIsAnalyzing(true);
      setAnalysis(null);
      const uploadRes = await notesAPI.uploadNote(form);
      const noteId = uploadRes.data.data.note._id;
      await runAnalysis(noteId);
    } catch (err) {
      showToast.error(getErrorMessage(err) || 'Failed to analyze resume');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const atsScore = analysis?.atsScore ?? 0;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">
            Resume Analyzer
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Upload your resume and get AI-powered feedback to improve your chances
          </p>
        </div>

        {/* Upload zone */}
        {!analysis && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 shadow-sm">
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16 gap-4">
                <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Analyzing your resume…
                </p>
              </div>
            ) : (
              <DropZone onFileSelected={handleFileSelected} />
            )}
          </div>
        )}

        {/* Analysis results */}
        {analysis && (
          <div className="space-y-5 sm:space-y-8">

            {/* Title */}
            <div className="flex items-center gap-2 sm:gap-3">
              <CheckIcon />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                Analysis Complete
              </h2>
            </div>

            {/* ATS Score */}
            <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
              <CircularProgress
                value={atsScore}
                progress={atsScore}
                size={110}
                stroke={10}
                color={getAtsColor(atsScore)}
              />
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                  ATS Compatibility Score
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                  {atsScore < 50
                    ? 'Needs significant improvement for applicant tracking systems.'
                    : atsScore < 75
                      ? 'Good foundation — a few optimizations will help you stand out.'
                      : 'Strong ATS compatibility — your resume is well optimized.'}
                </p>
              </div>
            </section>

            {/* Detected Skills */}
            {analysis.detectedSkills.length > 0 && (
              <section>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">
                  Detected Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.detectedSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 sm:px-3 py-1 text-xs sm:text-sm rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5">
                <h3 className="text-base sm:text-lg font-semibold text-green-700 dark:text-green-400 mb-2 sm:mb-3">
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {(analysis.strengths.length > 0
                    ? analysis.strengths
                    : ['No specific strengths identified']
                  ).map((item, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                      <span className="flex-shrink-0">✅</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5">
                <h3 className="text-base sm:text-lg font-semibold text-red-700 dark:text-red-400 mb-2 sm:mb-3">
                  Weaknesses
                </h3>
                <ul className="space-y-2">
                  {(analysis.weaknesses.length > 0
                    ? analysis.weaknesses
                    : ['No specific weaknesses identified']
                  ).map((item, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                      <span className="flex-shrink-0">❌</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {/* Missing Keywords */}
            {analysis.missingKeywords.length > 0 && (
              <section>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">
                  Missing Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingKeywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 sm:px-3 py-1 text-xs sm:text-sm rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Improvement Suggestions */}
            {analysis.improvementSuggestions.length > 0 && (
              <section>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">
                  Improvement Suggestions
                </h3>
                <ol className="space-y-2 sm:space-y-3 list-none">
                  {analysis.improvementSuggestions.map((suggestion, idx) => (
                    <li
                      key={idx}
                      className="flex gap-2 sm:gap-3 p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900"
                    >
                      <span className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 pt-0.5">
                        {suggestion}
                      </p>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Overall Feedback */}
            {analysis.overallFeedback && (
              <section>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">
                  Overall Feedback
                </h3>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800 rounded-xl p-3 sm:p-4">
                  {analysis.overallFeedback}
                </p>
              </section>
            )}

            <button
              type="button"
              onClick={() => setAnalysis(null)}
              className="w-full py-2.5 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm sm:text-base font-semibold rounded-xl transition-colors"
            >
              Analyze Another
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ResumePage;