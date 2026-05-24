import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { chatAPI, notesAPI } from '../services/api';
import { showToast } from '../components/common/CommonComponents';
import { TypingIndicator } from '../components/common/TypingIndicator';
import { MainLayout } from '../layouts/MainLayout';
import { useAuthStore } from '../context/authStore';
import { getErrorMessage } from '../utils/helpers';

const TYPING_ID = '__typing__';
const MAX_TEXTAREA_ROWS = 5;

const formatMessageTime = (timestamp) =>
  new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  });

const formatChatDate = (timestamp) =>
  new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  });

// Icons
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);
const SendIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);
const ChatIcon = () => (
  <svg className="w-10 h-10 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);
const TrashIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const MenuIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

// Markdown message renderer
const MessageContent = ({ content, isUser }) => {
  if (isUser) {
    return <p className="text-sm whitespace-pre-wrap break-words">{content}</p>;
  }
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-sm">{children}</li>,
          code: ({ inline, children }) =>
            inline
              ? <code className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-xs font-mono">{children}</code>
              : <pre className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700 overflow-x-auto text-xs font-mono mt-2 mb-2"><code>{children}</code></pre>,
          h1: ({ children }) => <h1 className="text-base font-bold mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-sm font-bold mb-1">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-blue-400 pl-3 italic text-gray-600 dark:text-gray-400 my-2">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export const ChatPage = () => {
  const { user, isGuest } = useAuthStore();

  // Chat sessions (logged-in users)
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);

  // Messages
  const [messages, setMessages] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const lh = parseInt(getComputedStyle(el).lineHeight, 10) || 24;
    el.style.height = `${Math.min(el.scrollHeight, lh * MAX_TEXTAREA_ROWS)}px`;
  }, []);

  const loadChat = async (chatId) => {
    try {
      setIsLoadingHistory(true);
      setActiveChatId(chatId);
      const res = await chatAPI.getChat(chatId);
      setMessages(res.data.data.chat.messages || []);
    } catch (err) {
      showToast.error('Failed to load chat');
      setMessages([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Load initial data
  useEffect(() => {
    const init = async () => {
      try {
        setIsLoadingHistory(true);

        if (isGuest) {
          // Guest: always start with empty messages — no history loaded
          // Only load notes for context selection
          const notesRes = await notesAPI.getNotes({ limit: 100 });
          setNotes(notesRes.data.data.notes || []);
          setMessages([]);
        } else {
          // Logged-in: load chat list + notes
          const [chatsRes, notesRes] = await Promise.all([
            chatAPI.getChats({ limit: 50 }),
            notesAPI.getNotes({ limit: 100 }),
          ]);
          const chatList = chatsRes.data.data.chats || [];
          setChats(chatList);
          setNotes(notesRes.data.data.notes || []);

          // Auto-load most recent chat
          if (chatList.length > 0) {
            await loadChat(chatList[0]._id);
            return; // loadChat handles setIsLoadingHistory(false) in its own finally
          }
        }
      } catch (error) {
        showToast.error(getErrorMessage(error) || 'Failed to load chat');
        setMessages([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    init();
  }, [isGuest]);

  useEffect(() => { scrollToBottom(); }, [messages]);
  useEffect(() => { resizeTextarea(); }, [inputValue]);

  const handleNewChat = async () => {
    try {
      const res = await chatAPI.createChat({ title: 'New Chat' });
      const newChat = res.data.data.chat;
      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newChat._id);
      setMessages([]);
      setSidebarOpen(false);
    } catch (err) {
      showToast.error('Failed to create chat');
    }
  };

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    try {
      await chatAPI.deleteChat(chatId);
      setChats((prev) => prev.filter((c) => c._id !== chatId));
      if (activeChatId === chatId) {
        setMessages([]);
        setActiveChatId(null);
      }
    } catch (err) {
      showToast.error('Failed to delete chat');
    }
  };

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isSending) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setInputValue('');
    setIsSending(true);
    setMessages((prev) => [...prev, userMsg, { id: TYPING_ID, role: 'typing' }]);

    try {
      let aiMessage;

      if (isGuest) {
        // Guest: send message without persisting history
        const payload = { message: trimmed };
        if (selectedNoteId) payload.noteId = selectedNoteId;
        const res = await chatAPI.sendMessage(payload);
        aiMessage = res.data.data.message;
      } else {
        // Logged-in: use chat session
        let chatId = activeChatId;

        // Auto-create chat if none selected
        if (!chatId) {
          const res = await chatAPI.createChat({ title: trimmed.slice(0, 40) });
          const newChat = res.data.data.chat;
          chatId = newChat._id;
          setActiveChatId(chatId);
          setChats((prev) => [newChat, ...prev]);
        }

        const res = await chatAPI.sendChatMessage(chatId, trimmed);
        aiMessage = res.data.data.message;

        // Update chat title if it's first message
        setChats((prev) => prev.map((c) =>
          c._id === chatId
            ? { ...c, title: c.title === 'New Chat' ? trimmed.slice(0, 40) : c.title }
            : c
        ));
      }

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
      setMessages((prev) => prev.filter((m) => m.id !== TYPING_ID));
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

  // Sidebar for logged-in users
  const ChatSidebar = () => (
    <div className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col
      transform transition-transform duration-300 ease-in-out
      md:relative md:translate-x-0 md:z-auto md:inset-auto
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* Sidebar header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h2 className="font-semibold text-sm text-gray-200">Conversations</h2>
        <button
          onClick={handleNewChat}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <PlusIcon /> New
        </button>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoadingChats ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3].map(n => (
              <div key={n} className="animate-pulse h-10 bg-gray-700 rounded-lg" />
            ))}
          </div>
        ) : chats.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-8">No conversations yet</p>
        ) : (
          chats.map((chat) => (
            <button
              key={chat._id}
              onClick={() => { loadChat(chat._id); setSidebarOpen(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors group flex items-center justify-between gap-2 ${
                activeChatId === chat._id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{chat.title || 'New Chat'}</p>
                <p className="text-gray-400 text-xs mt-0.5">{formatChatDate(chat.createdAt)}</p>
              </div>
              <button
                onClick={(e) => handleDeleteChat(e, chat._id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all shrink-0"
                aria-label="Delete chat"
              >
                <TrashIcon />
              </button>
            </button>
          ))
        )}
      </div>

      {/* User info */}
      <div className="p-3 border-t border-gray-700">
        <p className="text-xs text-gray-400 truncate">
          {user?.email || user?.name}
        </p>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-5rem)] md:h-[calc(100vh-4rem)] md:-m-8 overflow-hidden">

        {/* Sidebar — only for logged-in users */}
        {!isGuest && <ChatSidebar />}

        {/* Overlay for mobile sidebar */}
        {!isGuest && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-900">

          {/* Top bar */}
          <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            {/* Sidebar toggle — logged-in mobile only */}
            {!isGuest && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
              >
                <MenuIcon />
              </button>
            )}

            {/* Note selector */}
            <select
              value={selectedNoteId}
              onChange={(e) => setSelectedNoteId(e.target.value)}
              disabled={isSending}
              className="flex-1 max-w-sm px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">💬 General chat</option>
              {notes.map((note) => (
                <option key={note._id} value={note._id}>📄 {note.title}</option>
              ))}
            </select>

            {/* New chat button for logged-in desktop */}
            {!isGuest && (
              <button
                onClick={handleNewChat}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <PlusIcon /> New Chat
              </button>
            )}

            {/* Guest badge */}
            {isGuest && (
              <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                Guest — chat clears on logout
              </span>
            )}
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : isEmpty ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-4 px-4">
                <ChatIcon />
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {isGuest ? 'Start a conversation' : activeChatId ? 'No messages yet' : 'Start a new conversation'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isGuest
                      ? 'Your chat history is saved for this session only'
                      : 'Ask anything — your conversations are saved'}
                  </p>
                </div>
                {/* Quick prompts */}
                <div className="flex flex-wrap justify-center gap-2 mt-2 max-w-lg">
                  {['Explain a concept', 'Help me study', 'Quiz me', 'Summarize notes'].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setInputValue(prompt)}
                      className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {displayMessages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id || msg._id || `${msg.role}-${msg.timestamp}`}
                      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {/* Avatar */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        isUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                      }`}>
                        {isUser ? (user?.name?.[0] || isGuest ? 'G' : 'U') : 'AI'}
                      </div>

                      {/* Bubble */}
                      <div className={`flex flex-col max-w-[80%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
                        <div className={`rounded-2xl px-4 py-3 ${
                          isUser
                            ? 'bg-blue-600 text-white rounded-tr-sm'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-sm'
                        }`}>
                          <MessageContent content={msg.content} isUser={isUser} />
                        </div>
                        <span className="text-xs text-gray-400 mt-1 px-1">
                          {formatMessageTime(msg.timestamp)}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Typing indicator */}
                {showTyping && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                      AI
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
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
            <div className="max-w-3xl mx-auto">
              <div className="flex items-end gap-2 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2 border border-gray-300 dark:border-gray-600 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything... (Shift+Enter for new line)"
                  disabled={isSending}
                  className="flex-1 resize-none overflow-y-auto bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none disabled:opacity-50 py-1"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isSending || !inputValue.trim()}
                  aria-label="Send message"
                  className="flex-shrink-0 p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors mb-0.5"
                >
                  <SendIcon />
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">
                {isGuest
                  ? '⚠️ Guest mode — chat history will be lost on logout'
                  : 'Your conversations are saved and private to you'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ChatPage;