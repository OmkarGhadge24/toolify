import React, { useState } from 'react';
import { FiUpload, FiDownload } from 'react-icons/fi';
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

const VideoToAudio = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { theme } = useTheme();

  const resetState = () => {
    setFile(null);
    setError('');
    setLoading(false);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('video/')) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError('File size exceeds 500MB limit.');
        return;
      }
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a valid video file');
      setFile(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('video/')) {
      if (droppedFile.size > MAX_FILE_SIZE) {
        setError('File size exceeds 500MB limit.');
        return;
      }
      setFile(droppedFile);
      setError('');
    } else {
      setError('Please drop a valid video file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const extractAudio = async () => {
    if (!file) {
      setError('Please select a video file first');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('video', file);

    try {
      const response = await axios.post('http://localhost:5000/api/video/extract-audio', formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 300000 // 5 minutes timeout for large videos
      });

      // Check if the response is an error message
      const contentType = response.headers['content-type'];
      if (contentType && contentType.includes('application/json')) {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const errorData = JSON.parse(reader.result);
            setError(errorData.error || 'Error extracting audio');
          } catch (e) {
            setError('Error extracting audio. Please try again.');
          }
        };
        reader.readAsText(response.data);
        return;
      }

      // Create download link for successful response
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'audio/mp3' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'extracted-audio.mp3');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      resetState();
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. The video might be too large or the server is busy.');
      } else if (err.response?.status === 404) {
        setError('Server endpoint not found. Please check if the backend server is running.');
      } else if (err.response?.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const errorData = JSON.parse(reader.result);
            setError(errorData.error || 'Error extracting audio');
          } catch (e) {
            setError('Error extracting audio. Please try again.');
          }
        };
        reader.readAsText(err.response.data);
      } else {
        setError(err.response?.data?.error || 'Error extracting audio. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${
      theme === "light" ? "bg-gray-50" : "bg-[#151623]"
    }`}>
      {/* Header */}
      <div className={`${
        theme === "light" 
          ? "bg-white shadow-sm" 
          : "bg-[#1a1b2e] shadow-sm"
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className={`flex items-center transition-colors ${
              theme === "light"
                ? "text-gray-600 hover:text-gray-900"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <FaArrowLeft className="mr-2" />
            Back to Tools
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <h1 className={`text-3xl font-bold mb-8 text-center ${
          theme === "light" ? "text-gray-800" : "text-white"
        }`}>
          Video to Audio Converter
        </h1>
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 ${
            theme === "light"
              ? "border-gray-300 hover:border-[#3B40E8]"
              : "border-gray-600 hover:border-[#3B40E8]"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
            id="video-input"
          />
          
          <label htmlFor="video-input" className="cursor-pointer">
            <FiUpload className={`mx-auto h-12 w-12 mb-4 ${
              theme === "light" ? "text-[#3B40E8]" : "text-[#3B40E8]"
            }`} />
            <p className={`text-lg mb-2 ${
              theme === "light" ? "text-gray-700" : "text-gray-200"
            }`}>
              {file ? file.name : 'Drag and drop your video here or click to browse'}
            </p>
            <p className={theme === "light" ? "text-gray-500" : "text-gray-400"}>
              Supports most video formats (MP4, AVI, MOV, etc.)
            </p>
          </label>
        </div>

        {error && (
          <div className={`px-4 py-3 rounded-lg mb-6 ${
            theme === "light"
              ? "bg-red-50 border border-red-200 text-red-600"
              : "bg-red-900/20 border border-red-800 text-red-400"
          }`}>
            {error}
          </div>
        )}

        <button
          onClick={extractAudio}
          disabled={!file || loading}
          className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
            !file || loading
              ? theme === "light"
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gray-600 cursor-not-allowed"
              : "bg-[#3B40E8] hover:bg-[#2D31B3]"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <FiDownload className="mr-2" />
              Extract Audio
            </div>
          )}
        </button>

        <div className={`mt-6 text-center text-sm ${
          theme === "light" ? "text-gray-500" : "text-gray-400"
        }`}>
          <p>Maximum file size: 500MB</p>
          <p>Output format: MP3</p>
        </div>
      </div>
    </div>
  );
};

export default VideoToAudio;
