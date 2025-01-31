import React, { useState } from 'react';
import { FiUpload, FiDownload, FiSettings } from 'react-icons/fi';
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const VideoEditor = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({
    quality: '720',
    fps: '30',
    bitrate: '1M'
  });
  const navigate = useNavigate();

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('video/')) {
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
      setFile(droppedFile);
      setError('');
    } else {
      setError('Please drop a valid video file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
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
    Object.keys(settings).forEach(key => {
      formData.append(key, settings[key]);
    });

    try {
      const response = await axios.post('/api/video/process-video', formData, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'processed-video.mp4');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setFile(null);
    } catch (err) {
      setError('Error processing video. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="max-w-7xl mx-auto px-4 mb-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Tools
          </button>
        </div>
      <h1 className="text-3xl font-bold mb-8 text-center">Video Editor</h1>
      
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6"
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
          <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg mb-2">
            {file ? file.name : 'Drag and drop your video here or click to browse'}
          </p>
          <p className="text-sm text-gray-500">
            Supports most video formats (MP4, AVI, MOV, etc.)
          </p>
        </label>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FiSettings className="h-5 w-5" />
          Video Settings
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quality
            </label>
            <select
              name="quality"
              value={settings.quality}
              onChange={handleSettingsChange}
              className="w-full rounded-md border border-gray-300 p-2"
            >
              <option value="480">480p</option>
              <option value="720">720p</option>
              <option value="1080">1080p</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              FPS
            </label>
            <select
              name="fps"
              value={settings.fps}
              onChange={handleSettingsChange}
              className="w-full rounded-md border border-gray-300 p-2"
            >
              <option value="24">24 fps</option>
              <option value="30">30 fps</option>
              <option value="60">60 fps</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bitrate
            </label>
            <select
              name="bitrate"
              value={settings.bitrate}
              onChange={handleSettingsChange}
              className="w-full rounded-md border border-gray-300 p-2"
            >
              <option value="500k">Low (500k)</option>
              <option value="1M">Medium (1M)</option>
              <option value="2M">High (2M)</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-center mb-4">
          {error}
        </div>
      )}

      <button
        onClick={processVideo}
        disabled={!file || loading}
        className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 ${
          !file || loading
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white font-semibold transition-colors`}
      >
        {loading ? (
          'Processing...'
        ) : (
          <>
            <FiDownload className="h-5 w-5" />
            Process Video
          </>
        )}
      </button>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Maximum file size: 500MB</p>
        <p>Output format: MP4</p>
      </div>
    </div>
  );
};

export default VideoEditor;
