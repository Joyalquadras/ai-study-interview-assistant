// frontend/src/pages/StarStoriesPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button, showToast } from '../components/common/CommonComponents';
import { getErrorMessage, truncateText } from '../utils/helpers';

const StorySkeleton = () => (
  <div className="animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700 h-32 mb-4" />
);

export const StarStoriesPage = () => {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [expandedStar, setExpandedStar] = useState({});
  const [mobileView, setMobileView] = useState('stories');

  const [situation, setSituation] = useState('');
  const [task, setTask] = useState('');
  const [action, setAction] = useState('');
  const [result, setResult] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);

  const loadStories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/star-stories');
      setStories(response.data.data || []);
    } catch (error) {
      showToast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStories(); }, []);

  const clearForm = () => {
    setSituation(''); setTask(''); setAction(''); setResult('');
    setTags([]); setTagInput('');
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = tagInput.trim();
      if (value && !tags.includes(value)) setTags([...tags, value]);
      setTagInput('');
    }
  };

  const removeTag = (tag) => setTags(tags.filter((t) => t !== tag));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!situation.trim() || !task.trim() || !action.trim() || !result.trim()) {
      showToast.error('Please fill in all STAR fields');
      return;
    }
    setSaving(true);
    try {
      await api.post('/star-stories', {
        situation: situation.trim(),
        task: task.trim(),
        action: action.trim(),
        result: result.trim(),
        tags,
      });
      showToast.success('STAR story saved');
      clearForm();
      await loadStories();
      setMobileView('stories'); // switch to stories after saving on mobile
    } catch (error) {
      showToast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this STAR story?')) return;
    try {
      await api.delete(`/star-stories/${id}`);
      showToast.success('Story deleted');
      setStories(stories.filter((s) => s._id !== id));
    } catch (error) {
      showToast.error(getErrorMessage(error));
    }
  };

  const toggleQuestions = (id) =>
    setExpandedQuestions((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleStar = (id) =>
    setExpandedStar((prev) => ({ ...prev, [id]: !prev[id] }));

  const formPanel = (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 md:sticky md:top-4">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
        Add STAR Story
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {[
          { label: 'Situation (what was the context?)', value: situation, setter: setSituation },
          { label: 'Task (what was your responsibility?)', value: task, setter: setTask },
          { label: 'Action (what did you do?)', value: action, setter: setAction },
          { label: 'Result (what was the outcome?)', value: result, setter: setResult },
        ].map(({ label, value, setter }) => (
          <div key={label}>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {label}
            </label>
            <textarea
              value={value}
              onChange={(e) => setter(e.target.value)}
              className="w-full min-h-[70px] sm:min-h-[80px] px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={saving}
            />
          </div>
        ))}

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags
          </label>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Type and press Enter"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={saving}
          />
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-indigo-600"
                    aria-label={`Remove ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full !bg-indigo-600 hover:!bg-indigo-700"
          isLoading={saving}
        >
          {saving ? 'AI is mapping questions...' : 'Save Story'}
        </Button>
      </form>
    </div>
  );

  const storiesPanel = (
    <main className="flex-1 min-w-0">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
        My Stories ({stories.length})
      </h2>

      {loading && (
        <div>
          <StorySkeleton />
          <StorySkeleton />
          <StorySkeleton />
        </div>
      )}

      {!loading && stories.length === 0 && (
        <div className="text-center py-12 sm:py-16 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            No stories yet. Add your first STAR story!
          </p>
        </div>
      )}

      {!loading && stories.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          {stories.map((story) => {
            const qCount = story.mappedQuestions?.length || 0;
            const questionsOpen = expandedQuestions[story._id];
            const starOpen = expandedStar[story._id];

            return (
              <div
                key={story._id}
                className="relative rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-5"
              >
                <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 font-medium mb-2 pr-12">
                  {truncateText(story.situation, 80)}
                </p>

                {story.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
                    {story.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => toggleQuestions(story._id)}
                  className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {questionsOpen ? '▲' : '▼'} {qCount} HR questions mapped
                </button>

                {questionsOpen && qCount > 0 && (
                  <ol className="mt-3 space-y-2 list-decimal list-inside">
                    {story.mappedQuestions.map((q, idx) => (
                      <li
                        key={idx}
                        className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                      >
                        <span className="flex-1">{q}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate('/mock-interview')}
                          className="self-end sm:self-auto shrink-0"
                        >
                          Practice →
                        </Button>
                      </li>
                    ))}
                  </ol>
                )}

                <button
                  type="button"
                  onClick={() => toggleStar(story._id)}
                  className="block mt-2 sm:mt-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  {starOpen ? 'Hide STAR details ▲' : 'Show STAR details ▼'}
                </button>

                {starOpen && (
                  <div className="mt-3 p-3 sm:p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-xs sm:text-sm space-y-2 text-gray-700 dark:text-gray-300">
                    <p><strong>Situation:</strong> {story.situation}</p>
                    <p><strong>Task:</strong> {story.task}</p>
                    <p><strong>Action:</strong> {story.action}</p>
                    <p><strong>Result:</strong> {story.result}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleDelete(story._id)}
                  className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 text-xs sm:text-sm text-red-600 hover:text-red-700 dark:text-red-400 font-medium"
                >
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );

  return (
    <div>
      {/* Mobile tab switcher */}
      <div className="flex md:hidden border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-4">
        <button
          type="button"
          onClick={() => setMobileView('stories')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            mobileView === 'stories'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400'
          }`}
        >
          My Stories ({stories.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileView('form')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            mobileView === 'form'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400'
          }`}
        >
          Add Story
        </button>
      </div>

      {/* Desktop: side by side | Mobile: tab-based */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 min-h-[calc(100vh-8rem)]">
        {/* Form — always shown on desktop, tab-controlled on mobile */}
        <aside className={`w-full md:w-96 shrink-0 ${mobileView === 'form' ? 'block' : 'hidden md:block'}`}>
          {formPanel}
        </aside>

        {/* Stories — always shown on desktop, tab-controlled on mobile */}
        <div className={`flex-1 min-w-0 ${mobileView === 'stories' ? 'block' : 'hidden md:block'}`}>
          {storiesPanel}
        </div>
      </div>
    </div>
  );
};

export default StarStoriesPage;