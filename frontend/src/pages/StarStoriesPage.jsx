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

  useEffect(() => {
    loadStories();
  }, []);

  const clearForm = () => {
    setSituation('');
    setTask('');
    setAction('');
    setResult('');
    setTags([]);
    setTagInput('');
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = tagInput.trim();
      if (value && !tags.includes(value)) {
        setTags([...tags, value]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

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

  const toggleQuestions = (id) => {
    setExpandedQuestions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleStar = (id) => {
    setExpandedStar((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[calc(100vh-8rem)]">
      <aside className="w-full md:w-96 shrink-0">
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 sticky top-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Add STAR Story
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Situation (what was the context?)
              </label>
              <textarea
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                className="w-full min-h-[80px] px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Task (what was your responsibility?)
              </label>
              <textarea
                value={task}
                onChange={(e) => setTask(e.target.value)}
                className="w-full min-h-[80px] px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Action (what did you do?)
              </label>
              <textarea
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full min-h-[80px] px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Result (what was the outcome?)
              </label>
              <textarea
                value={result}
                onChange={(e) => setResult(e.target.value)}
                className="w-full min-h-[80px] px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Type and press Enter"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
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
      </aside>

      <main className="flex-1 min-w-0">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
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
          <div className="text-center py-16 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
            <p className="text-gray-600 dark:text-gray-400">
              No stories yet. Add your first STAR story!
            </p>
          </div>
        )}

        {!loading && stories.length > 0 && (
          <div className="space-y-4">
            {stories.map((story) => {
              const qCount = story.mappedQuestions?.length || 0;
              const questionsOpen = expandedQuestions[story._id];
              const starOpen = expandedStar[story._id];

              return (
                <div
                  key={story._id}
                  className="relative rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5"
                >
                  <p className="text-gray-800 dark:text-gray-200 font-medium mb-2">
                    {truncateText(story.situation, 80)}
                  </p>

                  {story.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
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
                    className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {questionsOpen ? '▲' : '▼'} {qCount} HR questions mapped
                  </button>

                  {questionsOpen && qCount > 0 && (
                    <ol className="mt-3 space-y-2 list-decimal list-inside">
                      {story.mappedQuestions.map((q, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-gray-700 dark:text-gray-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                        >
                          <span>{q}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate('/mock-interview')}
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
                    className="block mt-3 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    {starOpen ? 'Hide STAR details ▲' : 'Show STAR details ▼'}
                  </button>

                  {starOpen && (
                    <div className="mt-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-sm space-y-2 text-gray-700 dark:text-gray-300">
                      <p>
                        <strong>Situation:</strong> {story.situation}
                      </p>
                      <p>
                        <strong>Task:</strong> {story.task}
                      </p>
                      <p>
                        <strong>Action:</strong> {story.action}
                      </p>
                      <p>
                        <strong>Result:</strong> {story.result}
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(story._id)}
                    className="absolute bottom-4 right-4 text-sm text-red-600 hover:text-red-700 dark:text-red-400 font-medium"
                  >
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default StarStoriesPage;
