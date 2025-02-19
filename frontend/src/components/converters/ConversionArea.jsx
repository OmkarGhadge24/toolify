import React, { useState, useRef } from "react";
import {
  FaFileUpload,
  FaSpinner,
  FaExclamationTriangle,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const ConversionArea = ({ converter, onConvert }) => {
  const [files, setFiles] = useState([]);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const { theme } = useTheme();

  const validateFile = (file) => {
    // For ZIP creation, accept all files
    if (converter.fromFormat === "FILES") return true;

    const extension = file.name.split(".").pop().toLowerCase();
    const expectedExt = converter.fromFormat.toLowerCase();

    if (extension !== expectedExt) {
      setError(
        `Invalid file format. Expected ${converter.fromFormat} file but received .${extension}`
      );
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
        setFiles((prev) => [...prev, ...selectedFiles]);
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
        setFiles((prev) => [...prev, ...droppedFiles]);
        setError(null);
      }
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const clearFiles = () => {
    setFiles([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
      console.error("Conversion error:", error);
      setError(error.message || "Conversion failed");
    } finally {
      setConverting(false);
    }
  };

  // Get the accept string for file input
  const getAcceptTypes = () => {
    if (converter.fromFormat === "FILES") return "*/*";
    return `.${converter.fromFormat.toLowerCase()}`;
  };

  return (
    <div
      className={`max-w-2xl mx-auto p-6 rounded-lg shadow-md ${
        theme === "light" ? "bg-white" : "bg-[#1a1b2e]"
      }`}
    >
      <div className="text-center mb-8">
        <h2
          className={`text-2xl font-bold ${
            theme === "light" ? "text-gray-800" : "text-white"
          }`}
        >
          {converter.title}
        </h2>
        <p className={theme === "light" ? "text-gray-600" : "text-gray-300"}>
          {converter.description}
        </p>
      </div>

      {error && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            theme === "light"
              ? "bg-red-50 border border-red-200"
              : "bg-red-900/20 border border-red-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <div
              className={`flex items-center ${
                theme === "light" ? "text-red-700" : "text-red-400"
              }`}
            >
              <FaExclamationTriangle className="mr-2" />
              <span className="font-semibold">Error</span>
            </div>
            <button
              onClick={() => setError(null)}
              className={
                theme === "light"
                  ? "text-red-500 hover:text-red-700"
                  : "text-red-400 hover:text-red-300"
              }
            >
              <FaTimes />
            </button>
          </div>
          <p
            className={`text-sm mt-2 ${
              theme === "light" ? "text-red-600" : "text-red-400"
            }`}
          >
            {error}
          </p>
        </div>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver
            ? "border-[#3B40E8] bg-[#3B40E8]/10"
            : files.length > 0
            ? "border-green-500 bg-green-500/10"
            : theme === "light"
            ? "border-gray-300 hover:border-[#3B40E8]"
            : "border-gray-600 hover:border-[#3B40E8]"
        }`}
      >
        <input
          type="file"
          onChange={handleFileChange}
          className="hidden"
          id="file-input"
          ref={fileInputRef}
          accept={getAcceptTypes()}
          multiple={converter.allowMultiple}
        />

        {files.length === 0 ? (
          <label htmlFor="file-input" className="cursor-pointer">
            <FaFileUpload className="mx-auto h-12 w-12 text-[#3B40E8] mb-4" />
            <h3
              className={`text-lg font-medium mb-2 ${
                theme === "light" ? "text-gray-900" : "text-white"
              }`}
            >
              Drop your files here
            </h3>
            <p
              className={`text-sm mb-4 ${
                theme === "light" ? "text-gray-500" : "text-gray-400"
              }`}
            >
              or click to select files
            </p>
            <input
              type="file"
              accept="file/*"
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#3B40E8] hover:bg-[#2D31B3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B40E8] cursor-pointer transition-colors"
            >
              Select File
            </label>
          </label>
        ) : (
          <div className="space-y-4">
            {files.map((file, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  theme === "light" ? "bg-white shadow-sm" : "bg-[#252942]"
                }`}
              >
                <span
                  className={`text-sm truncate ${
                    theme === "light" ? "text-gray-700" : "text-gray-200"
                  }`}
                >
                  {file.name}
                </span>
                <button
                  onClick={() => removeFile(index)}
                  className={`ml-2 p-1 rounded-full hover:bg-opacity-80 ${
                    theme === "light"
                      ? "text-gray-500 hover:text-gray-700"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            ))}

            <div className="flex justify-between mt-4">
              <button
                onClick={clearFiles}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  theme === "light"
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-[#252942] text-gray-200 hover:bg-[#2e3252]"
                }`}
              >
                Clear All
              </button>
              <button
                onClick={handleConvert}
                disabled={converting}
                className={`px-4 py-2 rounded-md text-sm font-medium text-white transition-colors ${
                  converting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#3B40E8] hover:bg-[#2D31B3]"
                }`}
              >
                {converting ? (
                  <span className="flex items-center">
                    <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Converting...
                  </span>
                ) : (
                  "Convert"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversionArea;
