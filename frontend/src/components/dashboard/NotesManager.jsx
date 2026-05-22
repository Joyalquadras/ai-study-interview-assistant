import React, { useState, useEffect } from 'react';
import { notesAPI } from '../../services/api';
import { Card, Button, showToast } from '../common/CommonComponents';
import { formatDate } from '../../utils/helpers';

export const NotesManager = () => {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const response = await notesAPI.getNotes({ limit: 50 });
      setNotes(response.data.data.notes);
    } catch (error) {
      showToast.error('Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      showToast.error('Please select a file');
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', uploadTitle || selectedFile.name);

      await notesAPI.uploadNote(formData);
      showToast.success('Note uploaded successfully!');
      setSelectedFile(null);
      setUploadTitle('');
      loadNotes();
    } catch (error) {
      showToast.error('Failed to upload note');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await notesAPI.deleteNote(noteId);
        showToast.success('Note deleted successfully');
        loadNotes();
      } catch (error) {
        showToast.error('Failed to delete note');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <h2 className="text-2xl font-bold mb-4">Upload Notes</h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer block"
            >
              <svg
                className="w-12 h-12 mx-auto text-gray-400 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <p className="text-gray-600">
                {selectedFile
                  ? selectedFile.name
                  : 'Click to select or drag and drop'}
              </p>
              <p className="text-sm text-gray-500">PDF or TXT files up to 10MB</p>
            </label>
          </div>

          <input
            type="text"
            placeholder="Note title (optional)"
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full"
          >
            Upload Note
          </Button>
        </form>
      </Card>

      {/* Notes List */}
      <Card>
        <h2 className="text-2xl font-bold mb-4">Your Notes</h2>
        {isLoading ? (
          <p className="text-gray-500">Loading notes...</p>
        ) : notes.length > 0 ? (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{note.title}</h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(note.createdAt)} • {(note.fileSize / 1024 / 1024).toFixed(2)}MB
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(note._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No notes yet. Upload your first note!</p>
        )}
      </Card>
    </div>
  );
};
