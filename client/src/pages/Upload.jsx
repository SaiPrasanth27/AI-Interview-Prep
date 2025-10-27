import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Upload = () => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents/list');
      setDocuments(response.data);
    } catch (error) {
      toast.error('Failed to fetch documents');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e, type) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0], type);
    }
  };

  const handleFileUpload = async (file, type) => {
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    if (!type) {
      // Show type selection modal
      const selectedType = await showTypeSelectionModal();
      if (!selectedType) return;
      type = selectedType;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(`${type === 'resume' ? 'Resume' : 'Job Description'} uploaded successfully!`);
      fetchDocuments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const showTypeSelectionModal = () => {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      modal.innerHTML = `
        <div class="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
          <h3 class="text-lg font-semibold mb-4">Select Document Type</h3>
          <div class="space-y-3">
            <button id="resume-btn" class="w-full bg-gold-600 hover:bg-gold-700 text-black py-2 px-4 rounded-md font-medium">
              Resume
            </button>
            <button id="jd-btn" class="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md font-medium">
              Job Description
            </button>
            <button id="cancel-btn" class="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium">
              Cancel
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      modal.querySelector('#resume-btn').onclick = () => {
        document.body.removeChild(modal);
        resolve('resume');
      };

      modal.querySelector('#jd-btn').onclick = () => {
        document.body.removeChild(modal);
        resolve('job_description');
      };

      modal.querySelector('#cancel-btn').onclick = () => {
        document.body.removeChild(modal);
        resolve(null);
      };
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await api.delete(`/documents/${id}`);
      toast.success('Document deleted successfully');
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const hasResume = documents.some(doc => doc.type === 'resume');
  const hasJobDescription = documents.some(doc => doc.type === 'job_description');
  const canStartChat = hasResume && hasJobDescription;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-primary to-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-primary to-orange-secondary rounded-full mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Document Upload</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your resume and job description to get personalized AI interview preparation
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-3">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${hasResume ? 'bg-orange-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
              <span className="text-xs font-semibold">1</span>
            </div>
            <div className={`h-1 w-12 ${hasResume ? 'bg-orange-primary' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${hasJobDescription ? 'bg-orange-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
              <span className="text-xs font-semibold">2</span>
            </div>
            <div className={`h-1 w-12 ${canStartChat ? 'bg-orange-primary' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${canStartChat ? 'bg-orange-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
              <span className="text-xs font-semibold">3</span>
            </div>
          </div>
        </div>

        {/* Upload Cards */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          
          {/* Resume Upload Card */}
          <div className="group">
            <div className={`bg-white rounded-xl shadow-lg p-6 border-2 transition-all duration-300 ${hasResume ? 'border-orange-primary shadow-orange-100' : 'border-gray-100 hover:border-orange-200'}`}>
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${hasResume ? 'bg-orange-primary' : 'bg-gray-100 group-hover:bg-orange-50'} transition-colors`}>
                  {hasResume ? (
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className={`w-10 h-10 ${hasResume ? 'text-white' : 'text-gray-400 group-hover:text-orange-primary'} transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">Resume</h3>
                <p className="text-gray-600 mb-6">Upload your professional resume</p>
                
                <div
                  className={`border-2 border-dashed rounded-lg p-6 transition-all duration-300 ${
                    dragActive ? 'border-orange-primary bg-orange-50 scale-105' : 'border-gray-300 hover:border-orange-primary hover:bg-orange-50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <svg className="mx-auto h-12 w-12 text-orange-primary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-700 mb-3">Drag & drop your resume</p>
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-primary to-orange-secondary text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Choose File
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf"
                      onChange={(e) => handleFileSelect(e, 'resume')}
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-4">PDF format, max 2MB</p>
                </div>
              </div>
            </div>
          </div>

          {/* Job Description Upload Card */}
          <div className="group">
            <div className={`bg-white rounded-xl shadow-lg p-6 border-2 transition-all duration-300 ${hasJobDescription ? 'border-orange-secondary shadow-orange-100' : 'border-gray-100 hover:border-orange-200'}`}>
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${hasJobDescription ? 'bg-orange-secondary' : 'bg-gray-100 group-hover:bg-orange-50'} transition-colors`}>
                  {hasJobDescription ? (
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className={`w-10 h-10 ${hasJobDescription ? 'text-white' : 'text-gray-400 group-hover:text-orange-secondary'} transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">Job Description</h3>
                <p className="text-gray-600 mb-6">Upload the job posting you're applying for</p>
                
                <div
                  className={`border-2 border-dashed rounded-lg p-6 transition-all duration-300 ${
                    dragActive ? 'border-orange-secondary bg-orange-50 scale-105' : 'border-gray-300 hover:border-orange-secondary hover:bg-orange-50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <svg className="mx-auto h-12 w-12 text-orange-secondary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-700 mb-3">Drag & drop job description</p>
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-secondary to-orange-primary text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Choose File
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf"
                      onChange={(e) => handleFileSelect(e, 'job_description')}
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-4">PDF format, max 2MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Uploaded Documents */}
        {documents.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-primary to-orange-secondary rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Uploaded Files</h2>
            </div>
            
            <div className="grid gap-4">
              {documents.map((doc) => (
                <div key={doc._id} className="flex items-center justify-between p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                      doc.type === 'resume' ? 'bg-orange-primary' : 'bg-orange-secondary'
                    } text-white`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">{doc.filename}</p>
                      <p className="text-gray-600">
                        {doc.type === 'resume' ? 'Resume' : 'Job Description'} • 
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="text-center">
          <button
            onClick={() => navigate('/chat')}
            disabled={!canStartChat}
            className={`inline-flex items-center px-12 py-4 text-xl font-bold rounded-2xl transition-all duration-300 ${
              canStartChat
                ? 'bg-gradient-to-r from-orange-primary to-orange-secondary text-white shadow-2xl hover:shadow-orange-200 transform hover:scale-105'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {canStartChat ? (
              <>
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start Interview Practice
              </>
            ) : (
              'Upload both documents to continue'
            )}
          </button>
          {!canStartChat && (
            <p className="text-gray-500 mt-4 text-lg">
              Complete both uploads to begin your AI interview preparation
            </p>
          )}
        </div>

        {/* Loading Overlay */}
        {uploading && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-primary border-t-transparent mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Document</h3>
                <p className="text-gray-600">Please wait while we analyze your file...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;