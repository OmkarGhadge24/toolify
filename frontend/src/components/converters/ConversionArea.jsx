import React, { useState } from 'react';
import { FaFileUpload, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

const ConversionArea = ({ fromFormat, toFormat, onConvert, onBack }) => {
  const [file, setFile] = useState(null);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
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
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setError(null);
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    
    setConverting(true);
    setError(null);
    
    try {
      await onConvert(file);
    } catch (error) {
      setError(error.message);
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <button
        onClick={onBack}
        className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
      >
        ← Back to converters
      </button>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          Convert {fromFormat} to {toFormat}
        </h2>
        <p className="text-gray-600 mt-2">
          Select your {fromFormat.toLowerCase()} file to convert to {toFormat.toLowerCase()}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-700 mb-2">
            <FaExclamationTriangle className="mr-2" />
            <span className="font-semibold">Conversion failed</span>
          </div>
          <p className="text-red-600 text-sm">{error}</p>
          {error.includes('LibreOffice') && (
            <a
              href="https://www.libreoffice.org/download/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm block mt-2"
            >
              Click here to download LibreOffice
            </a>
          )}
        </div>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-500'
          }`}
      >
        <input
          type="file"
          accept={`.${fromFormat.toLowerCase()}`}
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer block"
        >
          <div className="flex flex-col items-center">
            <div className={`p-4 rounded-full mb-4 ${
              dragOver ? 'bg-blue-100' : 'bg-blue-50'
            }`}>
              <FaFileUpload className="text-4xl text-blue-600" />
            </div>
            <span className="text-gray-600">
              {file ? file.name : `Click to upload ${fromFormat} file`}
            </span>
            <span className="text-sm text-gray-500 mt-2">
              or drag and drop your file here
            </span>
          </div>
        </label>
      </div>

      <button
        onClick={handleConvert}
        disabled={!file || converting}
        className={`mt-6 w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors
          ${!file || converting
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
          }`}
      >
        {converting ? (
          <span className="flex items-center justify-center">
            <FaSpinner className="animate-spin mr-2" />
            Converting...
          </span>
        ) : (
          'Convert Now'
        )}
      </button>
    </div>
  );
};

export default ConversionArea;
