import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Header */}
      <header className="bg-black text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 
                className="text-xl font-bold text-orange-primary cursor-pointer"
                onClick={() => navigate('/')}
              >
                InterviewAI
              </h1>
            </div>
            
            {isAuthenticated && (
              <nav className="hidden md:flex space-x-8">
                <button
                  onClick={() => navigate('/upload')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/upload')
                      ? 'bg-gradient-to-r from-orange-primary to-orange-secondary text-white'
                      : 'text-white hover:text-orange-primary'
                  }`}
                >
                  Upload Documents
                </button>
                <button
                  onClick={() => navigate('/chat')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/chat')
                      ? 'bg-gradient-to-r from-orange-primary to-orange-secondary text-white'
                      : 'text-white hover:text-orange-primary'
                  }`}
                >
                  Interview Chat
                </button>
              </nav>
            )}

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-orange-primary">
                    Welcome, {user?.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-gradient-to-r from-orange-primary to-orange-secondary hover:from-orange-dark hover:to-orange-primary text-white px-4 py-2 rounded-md text-sm font-medium transition-all transform hover:scale-105"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="space-x-2">
                  <button
                    onClick={() => navigate('/login')}
                    className="text-white hover:text-orange-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="bg-gradient-to-r from-orange-primary to-orange-secondary hover:from-orange-dark hover:to-orange-primary text-white px-4 py-2 rounded-md text-sm font-medium transition-all transform hover:scale-105"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-gray-400">
              © 2024 InterviewAI. Powered by AI for better interview preparation.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;