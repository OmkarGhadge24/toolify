import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaClipboard, FaArrowLeft, FaUpload, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const TextExtractor = () => {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (
      selectedFile &&
      (selectedFile.type === "image/jpeg" || selectedFile.type === "image/png")
    ) {
      if (selectedFile.size <= 500 * 1024) {
        setFile(selectedFile);
        setFileName(selectedFile.name);
        setExtractedText("");
      } else {
        toast.error("File size must be less than 500KB");
      }
    } else if (selectedFile) {
      toast.error("Please select a valid JPEG or PNG image");
    }
  };

  const handleCancelFile = () => {
    setFile(null);
    setFileName("");
    setExtractedText("");
    // Reset the file input
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select an image file");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/text-extractor/extract-text",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setExtractedText(response.data.text);
      toast.success("Text extracted successfully!");
    } catch (error) {
      const errorMessage = error.response?.data?.details || 
                         error.response?.data?.error || 
                         error.message || 
                         "Error processing image";
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!extractedText) {
      toast.info("No text to copy");
      return;
    }
    
    navigator.clipboard
      .writeText(extractedText)
      .then(() => {
        toast.success("Text copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy text to clipboard");
      });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm mb-6">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Tools
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Text Extractor
        </h1>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center relative">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png"
                  className="hidden"
                  id="fileInput"
                />
                <label
                  htmlFor="fileInput"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <FaUpload className="text-3xl text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {fileName || "Click to upload image (JPEG/PNG, max 500KB)"}
                  </span>
                </label>
                {file && (
                  <button
                    type="button"
                    onClick={handleCancelFile}
                    className="absolute top-2 right-2 p-1 text-gray-500 hover:text-red-500 transition-colors"
                    title="Remove file"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !file}
                className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                  loading || !file
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } transition-colors`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  "Extract Text"
                )}
              </button>
            </form>
          </div>

          {extractedText && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-700">
                  Extracted Text
                </h2>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <FaClipboard className="mr-2" />
                  Copy
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 min-h-[100px] whitespace-pre-wrap break-words text-gray-700">
                {extractedText}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextExtractor;
