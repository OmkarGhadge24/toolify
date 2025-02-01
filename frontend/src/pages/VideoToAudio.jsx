import React, { useState } from 'react';
import { FiUpload, FiDownload } from 'react-icons/fi';
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

const VideoToAudio = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
    <div className="max-w-4xl mx-auto p-4">
      <button onClick={() => navigate('/')} className="flex items-center text-gray-600 hover:text-gray-900">
        <FaArrowLeft className="mr-2" /> Back to Tools
      </button>
      <h1 className="text-3xl font-bold mb-8 text-center">Video to Audio Converter</h1>
      
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <button
        onClick={extractAudio}
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
            Extract Audio
          </>
        )}
      </button>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Maximum file size: 500MB</p>
        <p>Output format: MP3</p>
      </div>
    </div>
  );
};

export default VideoToAudio;
