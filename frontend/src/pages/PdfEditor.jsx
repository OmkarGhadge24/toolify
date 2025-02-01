import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaFilePdf, FaArrowLeft, FaTimes } from 'react-icons/fa';
import axios from 'axios';

const API_URL = 'http://localhost:5000'; // Update this to match your backend port

const PdfEditor = () => {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [splitPage, setSplitPage] = useState('');
  const [mode, setMode] = useState('merge'); // 'merge' or 'split'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateFile = (file) => {
    if (!file.type || !file.type.includes('pdf')) {
      setError('Please select only PDF files');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size should be less than 10MB');
      return false;
    }
    return true;
  };

  const handleFileChange = (e) => {
    setError('');
    const files = Array.from(e.target.files);
    
    // Validate each file
    const validFiles = files.filter(validateFile);
    if (validFiles.length !== files.length) {
      return;
    }

    setSelectedFiles(validFiles);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setError('');
  };

  const clearSelection = () => {
    setSelectedFiles([]);
    setError('');
  };

  const handleMergePdf = async () => {
    try {
      setLoading(true);
      setError('');
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      const response = await axios.post(`${API_URL}/api/pdf/merge`, formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Check if the response is an error message
      const contentType = response.headers['content-type'];
      if (contentType && contentType.includes('application/json')) {
        // Convert blob to text to read error message
        const text = await response.data.text();
        const error = JSON.parse(text);
        throw new Error(error.details || error.error || 'Failed to merge PDFs');
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'merged.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      clearSelection();
    } catch (error) {
      console.error('Error merging PDFs:', error);
      setError(error.message || 'Failed to merge PDFs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSplitPdf = async () => {
    try {
      setLoading(true);
      setError('');
      const formData = new FormData();
      formData.append('file', selectedFiles[0]);
      formData.append('splitPage', splitPage);

      const response = await axios.post(`${API_URL}/api/pdf/split`, formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Check if the response is JSON (error message)
      const contentType = response.headers['content-type'];
      if (contentType && contentType.includes('application/json')) {
        // Convert blob to text to parse error message
        const reader = new FileReader();
        reader.onload = function() {
          try {
            const error = JSON.parse(this.result);
            setError(error.details || error.error || 'Failed to split PDF');
          } catch (e) {
            setError('Failed to split PDF. Please try again.');
          }
        };
        reader.readAsText(response.data);
        return;
      }

      // If response is not JSON, it's the ZIP file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `split_${selectedFiles[0].name.replace('.pdf', '')}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      clearSelection();
      setSplitPage('');
    } catch (error) {
      console.error('Error splitting PDF:', error);
      // Try to get detailed error message from response
      if (error.response && error.response.data) {
        const reader = new FileReader();
        reader.onload = function() {
          try {
            const errorData = JSON.parse(this.result);
            setError(errorData.details || errorData.error || 'Failed to split PDF');
          } catch (e) {
            setError('Failed to split PDF. Please try again.');
          }
        };
        reader.readAsText(error.response.data);
      } else {
        setError(error.message || 'Failed to split PDF. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <FaArrowLeft className="h-5 w-5 mr-2" />
              Back to Tools
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl text-center font-bold text-gray-900">PDF Editor</h1>
        <div className="bg-white rounded-lg shadow p-6">
          {error && (
            <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}
          
          {/* Mode Selection */}
          <div className="flex gap-4 mb-8">
            <button
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                mode === 'merge'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => {
                setMode('merge');
                clearSelection();
              }}
            >
              Merge PDFs
            </button>
            <button
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                mode === 'split'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => {
                setMode('split');
                clearSelection();
              }}
            >
              Split PDF
            </button>
          </div>

          {mode === 'merge' ? (
            <div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select PDF files to merge
                </label>
                <input
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdf-upload"
                />
                <label
                  htmlFor="pdf-upload"
                  className="flex items-center justify-center w-full h-40 px-4 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <div className="text-center">
                    <FaUpload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600">
                      Click to select PDFs or drag and drop
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Select multiple PDF files (max 10MB each)
                    </p>
                  </div>
                </label>
              </div>
              {selectedFiles.length > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-medium">Selected Files:</h3>
                    <button
                      onClick={clearSelection}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ul className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between text-sm text-gray-600"
                        >
                          <div className="flex items-center">
                            <FaFilePdf className="mr-2 text-red-500" />
                            <span className="truncate max-w-xs">{file.name}</span>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="ml-2 text-gray-500 hover:text-red-600"
                          >
                            <FaTimes />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              <button
                onClick={handleMergePdf}
                disabled={selectedFiles.length < 2 || loading}
                className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  selectedFiles.length < 2 || loading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? 'Processing...' : 'Merge PDFs'}
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select PDF file to split
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdf-split-upload"
                />
                <label
                  htmlFor="pdf-split-upload"
                  className="flex items-center justify-center w-full h-40 px-4 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <div className="text-center">
                    <FaUpload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600">
                      Click to select a PDF or drag and drop
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Select a PDF file (max 10MB)
                    </p>
                  </div>
                </label>
              </div>
              {selectedFiles.length > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-medium">Selected File:</h3>
                    <button
                      onClick={clearSelection}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <FaFilePdf className="mr-2 text-red-500" />
                        <span className="truncate max-w-xs">
                          {selectedFiles[0].name}
                        </span>
                      </div>
                      <button
                        onClick={clearSelection}
                        className="ml-2 text-gray-500 hover:text-red-600"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Split at page number
                </label>
                <input
                  type="number"
                  value={splitPage}
                  onChange={(e) => setSplitPage(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  placeholder="Enter page number"
                />
              </div>
              <button
                onClick={handleSplitPdf}
                disabled={!selectedFiles.length || !splitPage || loading}
                className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                  !selectedFiles.length || !splitPage || loading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? 'Processing...' : 'Split PDF'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfEditor;