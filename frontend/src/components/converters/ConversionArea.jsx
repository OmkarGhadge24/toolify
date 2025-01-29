import React, { useState, useRef } from 'react';
import { FaFileUpload, FaSpinner, FaExclamationTriangle, FaTimes, FaTrash } from 'react-icons/fa';

const ConversionArea = ({ converter, onConvert }) => {
  const [files, setFiles] = useState([]);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    // For ZIP creation, accept all files
    if (converter.fromFormat === 'FILES') return true;

    const extension = file.name.split('.').pop().toLowerCase();
    const expectedExt = converter.fromFormat.toLowerCase();
    
    if (extension !== expectedExt) {
      setError(`Invalid file format. Expected ${converter.fromFormat} file but received .${extension}`);
      return false;
    }
    return true;
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      if (!converter.allowMultiple) {
        if (validateFile(selectedFiles[0])) {
          setFiles([selectedFiles[0]]);
          setError(null);
        }
      } else {
        setFiles(prev => [...prev, ...selectedFiles]);
        setError(null);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      if (!converter.allowMultiple) {
        if (validateFile(droppedFiles[0])) {
          setFiles([droppedFiles[0]]);
          setError(null);
        }
      } else {
        setFiles(prev => [...prev, ...droppedFiles]);
        setError(null);
      }
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const clearFiles = () => {
    setFiles([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    
    setConverting(true);
    setError(null);
    
    try {
      await onConvert(files);
      if (!converter.allowMultiple) {
        clearFiles();
      }
    } catch (error) {
      console.error('Conversion error:', error);
      setError(error.message || 'Conversion failed');
    } finally {
      setConverting(false);
    }
  };

  // Get the accept string for file input
  const getAcceptTypes = () => {
    if (converter.fromFormat === 'FILES') return '*/*';
    return `.${converter.fromFormat.toLowerCase()}`;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          {converter.title}
        </h2>
        <p className="text-gray-600 mt-2">
          {converter.description}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-red-700">
              <FaExclamationTriangle className="mr-2" />
              <span className="font-semibold">Error</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              <FaTimes />
            </button>
          </div>
          <p className="text-red-600 text-sm mt-2">{error}</p>
        </div>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragOver
            ? 'border-blue-500 bg-blue-50'
            : files.length > 0 
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-blue-500'
          }`}
      >
        <input
          type="file"
          onChange={handleFileChange}
          className="hidden"
          id="file-input"
          ref={fileInputRef}
          multiple={converter.allowMultiple}
          accept={getAcceptTypes()}
        />
        <label
          htmlFor="file-input"
          className="cursor-pointer flex flex-col items-center"
        >
          <FaFileUpload className={`text-4xl mb-4 ${
            files.length > 0 ? 'text-green-500' : 'text-gray-400'
          }`} />
          <span className="text-gray-600">
            {files.length > 0
              ? 'Click to add more files'
              : converter.allowMultiple
                ? 'Click to select files or drag and drop them here'
                : `Click to select a ${converter.fromFormat} file or drag and drop it here`
            }
          </span>
        </label>
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-700">Selected Files:</h3>
            <button
              onClick={clearFiles}
              className="text-red-500 hover:text-red-700 flex items-center"
            >
              <FaTrash className="mr-1" />
              Clear All
            </button>
          </div>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{file.name}</span>
                  <span className="text-xs text-gray-400">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={handleConvert}
          disabled={files.length === 0 || converting}
          className={`w-full py-2 px-4 rounded-lg ${
            files.length === 0 || converting
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white font-semibold flex items-center justify-center`}
        >
          {converting ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Converting...
            </>
          ) : (
            'Convert'
          )}
        </button>
      </div>
    </div>
  );
};

export default ConversionArea;
