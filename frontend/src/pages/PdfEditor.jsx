import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaFilePdf, FaArrowLeft, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const API_URL = 'http://localhost:5000';

const PdfEditor = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [splitPage, setSplitPage] = useState('0');
  const [splitMode, setSplitMode] = useState('page'); // 'page' or 'range'
  const [splitRange, setSplitRange] = useState('');
  const [mode, setMode] = useState('merge');
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

  const validatePageRange = (range) => {
    // Validate format: "1,3,4-5,6-9"
    const pattern = /^(\d+(-\d+)?)(,\d+(-\d+)?)*$/;
    if (!pattern.test(range)) {
      return false;
    }
    
    // Validate that ranges are valid (start <= end)
    const parts = range.split(',');
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        if (start > end) {
          return false;
        }
      }
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
      if (!selectedFiles[0]) {
        setError('Please select a PDF file');
        return;
      }

      if (splitMode === 'page' && (splitPage === '' || isNaN(splitPage))) {
        setError('Please enter a valid page number');
        return;
      }

      if (splitMode === 'range') {
        if (!splitRange) {
          setError('Please enter a page range');
          return;
        }
        if (!validatePageRange(splitRange)) {
          setError('Invalid page range format. Use format like: 1,3,4-5,6-9');
          return;
        }
      }

      setLoading(true);
      setError('');
      const formData = new FormData();
      formData.append('file', selectedFiles[0]);
      
      if (splitMode === 'page') {
        formData.append('splitPage', splitPage || '0');
        formData.append('splitRange', '');
        formData.append('mode', 'page');
      } else {
        formData.append('splitPage', '0');
        formData.append('splitRange', splitRange.trim());
        formData.append('mode', 'range');
      }

      const response = await axios.post(`${API_URL}/api/pdf/split`, formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      // Check if the response is JSON (error message)
      const contentType = response.headers['content-type'];
      if (contentType && contentType.includes('application/json')) {
        const text = await response.data.text();
        const error = JSON.parse(text);
        throw new Error(error.details || error.error || 'Failed to split PDF');
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
      setSplitPage('0');
      setSplitRange('');
    } catch (error) {
      console.error('Error splitting PDF:', error);
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        setError('Unable to connect to the server. Please make sure the backend server is running.');
      } else if (error.response) {
        // Handle blob error response
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result);
            setError(errorData.error || errorData.details || 'Failed to split PDF');
          } catch (e) {
            setError('Failed to split PDF. Please try again.');
          }
        };
        reader.onerror = () => {
          setError('Failed to split PDF. Please try again.');
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

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className={`text-2xl text-center font-bold mb-8 ${
          theme === "light" ? "text-gray-800" : "text-white"
        }`}>
          PDF Editor
        </h1>
        <div className={`rounded-lg shadow p-6 ${
          theme === "light" ? "bg-white" : "bg-[#1a1b2e]"
        }`}>
          {error && (
            <div className={`mb-4 p-4 rounded-lg ${
              theme === "light"
                ? "bg-red-50 border border-red-200 text-red-600"
                : "bg-red-900/20 border border-red-800 text-red-400"
            }`}>
              {error}
            </div>
          )}
          
          {/* Mode Selection */}
          <div className="flex gap-4 mb-8">
            <button
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                mode === 'merge'
                  ? 'bg-[#3B40E8] text-white'
                  : theme === "light"
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'bg-[#252942] text-gray-300 hover:bg-[#2e3252]'
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
                  ? 'bg-[#3B40E8] text-white'
                  : theme === "light"
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'bg-[#252942] text-gray-300 hover:bg-[#2e3252]'
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
                <label className={`block text-sm font-medium mb-2 ${
                  theme === "light" ? "text-gray-700" : "text-gray-200"
                }`}>
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
                  className={`flex items-center justify-center w-full h-40 px-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    theme === "light"
                      ? "border-gray-300 hover:border-[#3B40E8]"
                      : "border-gray-600 hover:border-[#3B40E8]"
                  }`}
                >
                  <div className="text-center">
                    <FaUpload className={`mx-auto h-10 w-10 mb-3 ${
                      theme === "light" ? "text-[#3B40E8]" : "text-[#3B40E8]"
                    }`} />
                    <p className={`text-sm ${
                      theme === "light" ? "text-gray-600" : "text-gray-300"
                    }`}>
                      Click to select PDFs or drag and drop
                    </p>
                    <p className={`mt-1 text-xs ${
                      theme === "light" ? "text-gray-500" : "text-gray-400"
                    }`}>
                      Select multiple PDF files (max 10MB each)
                    </p>
                  </div>
                </label>
              </div>
              {selectedFiles.length > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className={`text-sm font-medium ${
                      theme === "light" ? "text-gray-700" : "text-gray-200"
                    }`}>
                      Selected Files:
                    </h3>
                    <button
                      onClick={clearSelection}
                      className={`text-sm transition-colors ${
                        theme === "light"
                          ? "text-red-600 hover:text-red-800"
                          : "text-red-400 hover:text-red-300"
                      }`}
                    >
                      Clear All
                    </button>
                  </div>
                  <div className={`rounded-lg p-4 ${
                    theme === "light" ? "bg-gray-50" : "bg-[#252942]"
                  }`}>
                    <ul className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <li
                          key={index}
                          className={`flex items-center justify-between ${
                            theme === "light" ? "text-gray-600" : "text-gray-300"
                          }`}
                        >
                          <div className="flex items-center">
                            <FaFilePdf className="text-[#3B40E8] mr-2" />
                            <span className="truncate max-w-xs">{file.name}</span>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className={`ml-2 transition-colors ${
                              theme === "light"
                                ? "text-gray-500 hover:text-red-600"
                                : "text-gray-400 hover:text-red-400"
                            }`}
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
                className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                  selectedFiles.length < 2 || loading
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
                  'Merge PDFs'
                )}
              </button>
            </div>
          ) : (
            <div>
              {/* Split Mode Selection */}
              <div className="flex gap-4 mb-6">
                <button
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    splitMode === 'page'
                      ? 'bg-[#3B40E8] text-white'
                      : theme === "light"
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-[#252942] text-gray-300 hover:bg-[#2e3252]'
                  }`}
                  onClick={() => setSplitMode('page')}
                >
                  Split by Page Number
                </button>
                <button
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    splitMode === 'range'
                      ? 'bg-[#3B40E8] text-white'
                      : theme === "light"
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-[#252942] text-gray-300 hover:bg-[#2e3252]'
                  }`}
                  onClick={() => setSplitMode('range')}
                >
                  Split by Range
                </button>
              </div>

              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${
                  theme === "light" ? "text-gray-700" : "text-gray-200"
                }`}>
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
                  className={`flex items-center justify-center w-full h-40 px-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    theme === "light"
                      ? "border-gray-300 hover:border-[#3B40E8]"
                      : "border-gray-600 hover:border-[#3B40E8]"
                  }`}
                >
                  <div className="text-center">
                    <FaUpload className={`mx-auto h-10 w-10 mb-3 ${
                      theme === "light" ? "text-[#3B40E8]" : "text-[#3B40E8]"
                    }`} />
                    <p className={`text-sm ${
                      theme === "light" ? "text-gray-600" : "text-gray-300"
                    }`}>
                      Click to select a PDF or drag and drop
                    </p>
                    <p className={`mt-1 text-xs ${
                      theme === "light" ? "text-gray-500" : "text-gray-400"
                    }`}>
                      Select a PDF file (max 10MB)
                    </p>
                  </div>
                </label>
              </div>
              {selectedFiles.length > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className={`text-sm font-medium ${
                      theme === "light" ? "text-gray-700" : "text-gray-200"
                    }`}>
                      Selected File:
                    </h3>
                    <button
                      onClick={clearSelection}
                      className={`text-sm transition-colors ${
                        theme === "light"
                          ? "text-red-600 hover:text-red-800"
                          : "text-red-400 hover:text-red-300"
                      }`}
                    >
                      Clear
                    </button>
                  </div>
                  <div className={`rounded-lg p-4 ${
                    theme === "light" ? "bg-gray-50" : "bg-[#252942]"
                  }`}>
                    <div className={`flex items-center justify-between ${
                      theme === "light" ? "text-gray-600" : "text-gray-300"
                    }`}>
                      <div className="flex items-center">
                        <FaFilePdf className="text-[#3B40E8] mr-2" />
                        <span className="truncate max-w-xs">
                          {selectedFiles[0].name}
                        </span>
                      </div>
                      <button
                        onClick={clearSelection}
                        className={`ml-2 transition-colors ${
                          theme === "light"
                            ? "text-gray-500 hover:text-red-600"
                            : "text-gray-400 hover:text-red-400"
                        }`}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {splitMode === 'page' ? (
                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === "light" ? "text-gray-700" : "text-gray-200"
                  }`}>
                    Split at page number
                  </label>
                  <input
                    type="number"
                    value={splitPage}
                    onChange={(e) => setSplitPage(e.target.value)}
                    className={`w-full p-3 rounded-lg transition-colors ${
                      theme === "light"
                        ? "border border-gray-300 focus:border-[#3B40E8] bg-white text-gray-700"
                        : "border border-gray-600 focus:border-[#3B40E8] bg-[#252942] text-gray-200"
                    }`}
                    min="0"
                    placeholder="Enter page number (0 for all pages)"
                  />
                  <p className={`mt-2 text-sm ${
                    theme === "light" ? "text-gray-500" : "text-gray-400"
                  }`}>
                    Enter 0 to split into individual pages
                  </p>
                </div>
              ) : (
                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === "light" ? "text-gray-700" : "text-gray-200"
                  }`}>
                    Split by page range
                  </label>
                  <input
                    type="text"
                    value={splitRange}
                    onChange={(e) => setSplitRange(e.target.value)}
                    className={`w-full p-3 rounded-lg transition-colors ${
                      theme === "light"
                        ? "border border-gray-300 focus:border-[#3B40E8] bg-white text-gray-700"
                        : "border border-gray-600 focus:border-[#3B40E8] bg-[#252942] text-gray-200"
                    }`}
                    placeholder="e.g., 1,3,4-5,6-9"
                  />
                  <p className={`mt-2 text-sm ${
                    theme === "light" ? "text-gray-500" : "text-gray-400"
                  }`}>
                    Enter page numbers (e.g., 1,3,4-5,6-9)
                  </p>
                </div>
              )}
              <button
                onClick={handleSplitPdf}
                disabled={!selectedFiles.length || loading}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                  !selectedFiles.length || loading
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
                  'Split PDF'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfEditor;