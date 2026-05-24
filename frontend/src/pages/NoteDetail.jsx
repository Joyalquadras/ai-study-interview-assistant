import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { notesAPI } from '../services/api';
import { showToast } from '../components/common/CommonComponents';
import MCQQuiz from '../components/common/MCQQuiz';
import FlipCard from '../components/common/FlipCard';
import { MainLayout } from '../layouts/MainLayout';
import { formatDate, getErrorMessage } from '../utils/helpers';

const TABS = [
  { id: 'summary', label: 'Summary', type: 'summary' },
  { id: 'questions', label: 'Questions', type: 'questions' },
  { id: 'mcqs', label: 'MCQs', type: 'mcqs' },
  { id: 'flashcards', label: 'Flashcards', type: 'flashcards' },
  { id: 'interview-prep', label: 'Interview Prep', type: 'interview-questions' },
];

const TabSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((n) => (
      <div key={n} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-24" />
    ))}
  </div>
);

const DIFFICULTY_STYLES = {
  easy: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  hard: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const InterviewPrepCard = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  const difficulty = (item.difficulty || 'medium').toLowerCase();

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 sm:p-4 bg-white dark:bg-gray-900">
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 flex-1">
          {item.question || item}
        </p>
        {item.difficulty && (
          <span
            className={`flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
              DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES.medium
            }`}
          >
            {item.difficulty}
          </span>
        )}
      </div>
      {item.answer && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {expanded ? 'Hide answer' : 'Show answer'}
        </button>
      )}
      {expanded && item.answer && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-2">
          {item.answer}
        </p>
      )}
    </div>
  );
};

export const NoteDetail = () => {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [loading, setLoading] = useState(false);
  const [loadingNote, setLoadingNote] = useState(true);
  const [tabCache, setTabCache] = useState({});

  useEffect(() => {
    loadNote();
    setTabCache({});
    setActiveTab('summary');
  }, [id]);

  const loadNote = async () => {
    try {
      setLoadingNote(true);
      const res = await notesAPI.getNote(id);
      setNote(res.data.data.note);
    } catch (err) {
      showToast.error(getErrorMessage(err) || 'Failed to load note');
    } finally {
      setLoadingNote(false);
    }
  };

  const handleTabClick = async (tab) => {
    setActiveTab(tab.id);
    if (tabCache[tab.id]) return;
    try {
      setLoading(true);
      const res = await notesAPI.generateContent(id, tab.type);
      setTabCache((prev) => ({ ...prev, [tab.id]: res.data.data }));
    } catch (err) {
      showToast.error(getErrorMessage(err) || 'Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  const parseSummaryBullets = (summary) => {
    if (!summary) return [];
    if (Array.isArray(summary)) return summary;
    return summary.split(/\n|•/).map((s) => s.trim()).filter(Boolean);
  };

  const renderTabContent = () => {
    if (loading) return <TabSkeleton />;

    const data = tabCache[activeTab];

    if (!data) {
      return (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8 text-sm sm:text-base">
          Select a tab to generate content
        </p>
      );
    }

    switch (activeTab) {
      case 'summary': {
        const bullets = parseSummaryBullets(data.summary);
        return (
          <ul className="list-disc pl-4 sm:pl-5 space-y-2">
            {bullets.map((item, i) => (
              <li key={i} className="text-sm sm:text-base text-gray-800 dark:text-gray-200">
                {item}
              </li>
            ))}
          </ul>
        );
      }

      case 'questions': {
        const questions = data.questions || [];
        return (
          <ol className="space-y-3 list-decimal pl-4 sm:pl-5">
            {questions.map((q, i) => (
              <li key={i}>
                <div className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-sm sm:text-base text-gray-800 dark:text-gray-200">
                  {typeof q === 'string' ? q : q.question || q.text}
                </div>
              </li>
            ))}
          </ol>
        );
      }

      case 'mcqs':
        return <MCQQuiz questions={data.mcqs || []} noteId={note?._id} />;

      case 'flashcards': {
        const cards = data.flashcards || [];
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {cards.map((f, i) => (
              <FlipCard
                key={i}
                front={
                  <div className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 min-h-[80px] flex items-center justify-center text-center">
                    {f.front}
                  </div>
                }
                back={
                  <div className="text-sm sm:text-base text-gray-700 dark:text-gray-300 min-h-[80px] flex items-center justify-center text-center">
                    {f.back}
                  </div>
                }
              />
            ))}
          </div>
        );
      }

      case 'interview-prep': {
        const items = data.interviewQuestions || [];
        return (
          <div className="space-y-3">
            {items.map((item, i) => (
              <InterviewPrepCard key={i} item={item} />
            ))}
          </div>
        );
      }

      default:
        return null;
    }
  };

  if (loadingNote) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        {/* Note info card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
            {note?.title}
          </h1>
          {note?.description && (
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
              {note.description}
            </p>
          )}
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-2">
            Uploaded {formatDate(note?.uploadedAt || note?.createdAt)}
          </p>
          {note?.parsedContentPreview && (
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-3 sm:mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg leading-relaxed">
              {note.parsedContentPreview}
              {(note.content?.length > 200 || note.parsedContentPreview?.length >= 200) && '…'}
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex gap-0 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab)}
                className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 min-h-[300px]">
          {renderTabContent()}
        </div>
      </div>
    </MainLayout>
  );
};

export default NoteDetail;