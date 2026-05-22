import React, { useState, useEffect, useRef, useCallback } from 'react';
import { chatAPI, notesAPI } from '../services/api';
import { showToast } from '../components/common/CommonComponents';
import { TypingIndicator } from '../components/common/TypingIndicator';
import { MainLayout } from '../layouts/MainLayout';
import { getErrorMessage } from '../utils/helpers';

const TYPING_ID = '__typing__';
const MAX_TEXTAREA_ROWS = 4;

const formatMessageTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const ChatBubbleIcon = () => (
  <svg
    className="w-24 h-24 text-gray-300 dark:text-gray-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

const SendIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M14 5l7 7m0 0l-7 7m7-7H3"
    />
  </svg>
);

export const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight, 10) || 24;
    const maxHeight = lineHeight * MAX_TEXTAREA_ROWS;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoadingHistory(true);
        const [historyRes, notesRes] = await Promise.all([
          chatAPI.getHistory(),
          notesAPI.getNotes({ limit: 100 }),
        ]);
        setMessages(historyRes.data.data.messages || []);
        setNotes(notesRes.data.data.notes || []);
      } catch (error) {
        showToast.error(getErrorMessage(error) || 'Failed to load chat');
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    resizeTextarea();
  }, [inputValue, resizeTextarea]);

  const removeTypingIndicator = () => {
    setMessages((prev) => prev.filter((m) => m.id !== TYPING_ID));
  };

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isSending) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setInputValue('');
    setIsSending(true);
    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: TYPING_ID, role: 'typing' },
    ]);

    try {
      const payload = { message: trimmed };
      if (selectedNoteId) {
        payload.noteId = selectedNoteId;
      }

      const response = await chatAPI.sendMessage(payload);
      const aiMessage = response.data.data.message;

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== TYPING_ID),
        {
          id: `assistant-${Date.now()}`,
          role: aiMessage.role || 'assistant',
          content: aiMessage.content,
          timestamp: aiMessage.timestamp || new Date(),
        },
      ]);
    } catch (error) {
      removeTypingIndicator();
      showToast.error(getErrorMessage(error) || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const displayMessages = messages.filter((m) => m.role !== 'typing');
  const showTyping = messages.some((m) => m.role === 'typing');
  const isEmpty = !isLoadingHistory && displayMessages.length === 0;

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)] -m-8 max-w-4xl mx-auto w-full">
        {/* Note selector */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <label htmlFor="note-select" className="sr-only">
            Select note context
          </label>
          <select
            id="note-select"
            value={selectedNoteId}
            onChange={(e) => setSelectedNoteId(e.target.value)}
            disabled={isSending}
            className="w-full max-w-md px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No note (general chat)</option>
            {notes.map((note) => (
              <option key={note._id} value={note._id}>
                {note.title}
              </option>
            ))}
          </select>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 min-h-0">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <ChatBubbleIcon />
              <p className="text-lg text-gray-500 dark:text-gray-400">
                Start a conversation. Ask anything!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayMessages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id || msg._id || `${msg.role}-${msg.timestamp}`}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                        isUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 mt-1 px-1">
                      {formatMessageTime(msg.timestamp)}
                    </span>
                  </div>
                );
              })}

              {showTyping && (
                <div className="flex flex-col items-start">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                    <TypingIndicator />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              disabled={isSending}
              className="flex-1 resize-none overflow-y-auto px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={isSending || !inputValue.trim()}
              aria-label="Send message"
              className="flex-shrink-0 p-2.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ChatPage;
