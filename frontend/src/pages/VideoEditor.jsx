import React, { useState } from 'react';
import { FiUpload, FiDownload, FiSettings } from 'react-icons/fi';
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

const VideoEditor = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({ quality: '720', fps: '30', bitrate: '1M' });
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

  const processVideo = async () => {
    if (!file) {
      setError('Please select a video file first');
      return;
    }

    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('video', file);
    Object.keys(settings).forEach(key => formData.append(key, settings[key]));

    try {
      const response = await axios.post('http://localhost:5000/api/video/process-video', formData, {
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
            setError(errorData.error || 'Error processing video');
          } catch (e) {
            setError('Error processing video. Please try again.');
          }
        };
        reader.readAsText(response.data);
        return;
      }

      // Create download link for successful response
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'video/mp4' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'processed-video.mp4');
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
            setError(errorData.error || 'Error processing video');
          } catch (e) {
            setError('Error processing video. Please try again.');
          }
        };
        reader.readAsText(err.response.data);
      } else {
        setError(err.response?.data?.error || 'Error processing video. Please try again.');
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
          Video Editor
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
              {file ? file.name : 'Drag and drop or click to browse'}
            </p>
            <p className={theme === "light" ? "text-gray-500" : "text-gray-400"}>
              Supports MP4, AVI, MOV, etc. (Max 500MB)
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

        <div className={`rounded-lg p-6 mb-6 ${
          theme === "light" ? "bg-gray-50" : "bg-[#1a1b2e]"
        }`}>
          <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${
            theme === "light" ? "text-gray-800" : "text-white"
          }`}>
            <FiSettings className="h-5 w-5" /> Video Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select 
              name="quality" 
              value={settings.quality} 
              onChange={e => setSettings({ ...settings, quality: e.target.value })} 
              className={`rounded p-2 w-full transition-colors ${
                theme === "light"
                  ? "border border-gray-300 bg-white text-gray-700"
                  : "border border-gray-600 bg-[#252942] text-gray-200"
              }`}
              disabled={loading}
            >
              <option value="480">480p</option>
              <option value="720">720p</option>
              <option value="1080">1080p</option>
            </select>
            <select 
              name="fps" 
              value={settings.fps} 
              onChange={e => setSettings({ ...settings, fps: e.target.value })} 
              className={`rounded p-2 w-full transition-colors ${
                theme === "light"
                  ? "border border-gray-300 bg-white text-gray-700"
                  : "border border-gray-600 bg-[#252942] text-gray-200"
              }`}
              disabled={loading}
            >
              <option value="24">24 FPS</option>
              <option value="30">30 FPS</option>
              <option value="60">60 FPS</option>
            </select>
            <select 
              name="bitrate" 
              value={settings.bitrate} 
              onChange={e => setSettings({ ...settings, bitrate: e.target.value })} 
              className={`rounded p-2 w-full transition-colors ${
                theme === "light"
                  ? "border border-gray-300 bg-white text-gray-700"
                  : "border border-gray-600 bg-[#252942] text-gray-200"
              }`}
              disabled={loading}
            >
              <option value="500k">Low (500k)</option>
              <option value="1M">Medium (1M)</option>
              <option value="2M">High (2M)</option>
              <option value="5M">Ultra (5M)</option>
            </select>
          </div>
        </div>

        <button
          onClick={processVideo}
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
              Processing Video...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <FiDownload className="mr-2" />
              Process & Download
            </div>
          )}
        </button>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Maximum file size: 500MB</p>
          <p>Output formats: MP4</p>
        </div>
      </div>
    </div>
  );
};

export default VideoEditor;
