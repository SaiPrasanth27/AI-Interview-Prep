import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/upload');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Hero Section */}
          <div className="mb-16">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Ace Your Next
              <span className="text-orange-primary block">Interview</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              AI-powered interview preparation that analyzes your resume and job descriptions 
              to provide personalized practice sessions and feedback.
            </p>
            <div className="space-x-4">
              <button
                onClick={() => navigate('/signup')}
                className="bg-gradient-to-r from-orange-primary to-orange-secondary hover:from-orange-dark hover:to-orange-primary text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                Get Started Free
              </button>
              <button
                onClick={() => navigate('/login')}
                className="border-2 border-orange-primary text-orange-primary hover:bg-gradient-to-r hover:from-orange-primary hover:to-orange-secondary hover:text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all"
              >
                Sign In
              </button>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-primary to-orange-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Smart Document Analysis</h3>
              <p className="text-gray-400">
                Upload your resume and job descriptions. Our AI analyzes both to create targeted interview questions.
              </p>
            </div>

            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-primary to-orange-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">AI Interview Practice</h3>
              <p className="text-gray-400">
                Practice with our AI interviewer that asks relevant questions and provides real-time feedback.
              </p>
            </div>

            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-primary to-orange-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Performance Scoring</h3>
              <p className="text-gray-400">
                Get detailed scores and feedback on your responses to improve your interview performance.
              </p>
            </div>
          </div>

          {/* How it Works */}
          <div className="bg-gray-800 rounded-2xl p-12 border border-gray-700">
            <h2 className="text-3xl font-bold text-white mb-8">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-primary to-orange-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                  1
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Sign Up</h4>
                <p className="text-gray-400 text-sm">Create your free account</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-primary to-orange-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                  2
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Upload</h4>
                <p className="text-gray-400 text-sm">Upload resume & job description</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-primary to-orange-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                  3
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Practice</h4>
                <p className="text-gray-400 text-sm">Chat with AI interviewer</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-primary to-orange-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                  4
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Improve</h4>
                <p className="text-gray-400 text-sm">Get feedback & ace the interview</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;