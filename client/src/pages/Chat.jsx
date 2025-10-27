import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [citations, setCitations] = useState([]);
  const [selectedCitation, setSelectedCitation] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkDocuments();
    fetchChatHistory();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkDocuments = async () => {
    try {
      const response = await api.get('/documents/list');
      const documents = response.data;
      const hasResume = documents.some(doc => doc.type === 'resume');
      const hasJobDescription = documents.some(doc => doc.type === 'job_description');

      if (!hasResume || !hasJobDescription) {
        toast.error('Please upload both resume and job description first');
        navigate('/upload');
      }
    } catch (error) {
      toast.error('Failed to check documents');
      navigate('/upload');
    }
  };

  const fetchChatHistory = async () => {
    try {
      const response = await api.get('/chat/history');
      if (response.data.messages.length > 0) {
        setMessages(response.data.messages);
        setChatStarted(true);
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    }
  };

  const startChat = async () => {
    setLoading(true);
    try {
      const response = await api.post('/chat/start');
      setMessages([{
        role: 'assistant',
        content: response.data.initialMessage,
        createdAt: new Date().toISOString()
      }]);
      setChatStarted(true);
      toast.success('Interview session started!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start chat');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await api.post('/chat/query', {
        message: inputMessage
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.data.response,
        score: response.data.score,
        createdAt: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setCitations(response.data.citations || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
      // Remove the user message if the request failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatMessage = (content) => {
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (!chatStarted && messages.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background-primary to-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-primary to-orange-secondary rounded-full mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Interview Session</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              I'll analyze your documents and create personalized interview questions for you.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-primary to-orange-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Begin?</h2>
            <p className="text-gray-600 mb-8 text-lg">
              Your personalized interview practice session is ready to start
            </p>
            <button
              onClick={startChat}
              disabled={loading}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-primary to-orange-secondary text-white font-bold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 text-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                  Starting Interview...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Start Interview Practice
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-primary to-orange-secondary rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Interview Assistant</h1>
                  <p className="text-xs text-gray-500">AI-Powered Practice Session</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Active Session</span>
              </div>
              <button
                onClick={() => navigate('/upload')}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-orange-primary hover:text-orange-secondary border border-orange-primary hover:border-orange-secondary rounded-md transition-colors"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                New Documents
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-6xl mx-auto space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3xl ${message.role === 'user'
                      ? 'bg-gradient-to-r from-orange-primary to-orange-secondary text-white rounded-2xl rounded-br-md px-4 py-3 shadow-sm'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm'
                      }`}
                  >
                    <div className="whitespace-pre-wrap">
                      {formatMessage(message.content)}
                    </div>
                    {message.score && (
                      <div className={`mt-2 text-sm font-semibold ${getScoreColor(message.score)}`}>
                        Score: {message.score}/10
                      </div>
                    )}
                    <div className="text-xs opacity-70 mt-2">
                      {formatTime(message.createdAt)}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-lg px-4 py-3 shadow-sm border">
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-primary mr-2"></div>
                      <span className="text-gray-600">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Citations */}
          {citations.length > 0 && (
            <div className="bg-white border-t px-4 py-3">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-sm font-medium text-gray-700 mb-2">References from your documents:</h3>
                <div className="flex flex-wrap gap-2">
                  {citations.map((citation, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedCitation(citation)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded border"
                    >
                      {citation.type === 'resume' ? '📄' : '💼'} {citation.type} (similarity: {(citation.similarity * 100).toFixed(0)}%)
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="bg-white border-t shadow-lg px-4 py-6">
            <div className="max-w-6xl mx-auto flex space-x-4">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your response here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-primary focus:border-transparent resize-none shadow-sm"
                  rows="3"
                  disabled={loading}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || loading}
                className="bg-gradient-to-r from-orange-primary to-orange-secondary hover:from-orange-dark hover:to-orange-primary disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-all self-end shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Citation Modal */}
      {selectedCitation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {selectedCitation.type === 'resume' ? 'Resume' : 'Job Description'} Reference
                </h3>
                <button
                  onClick={() => setSelectedCitation(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="text-gray-700 whitespace-pre-wrap">
                {selectedCitation.text}
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Similarity: {(selectedCitation.similarity * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;