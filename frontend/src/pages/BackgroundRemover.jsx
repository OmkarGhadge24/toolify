import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCloudUploadAlt } from 'react-icons/fa';
import axios from 'axios';

const BackgroundRemover = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const navigate = useNavigate();

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    if (!file) return;

    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload only JPG, JPEG or PNG files');
      return;
    }

    // Check file size (5MB = 5 * 1024 * 1024 bytes)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setProcessedImage(null);
  };

  const removeBackground = async () => {
    if (!selectedFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await axios.post('http://localhost:5000/api/remove-background', formData, {
        responseType: 'blob'
      });
      
      const url = URL.createObjectURL(response.data);
      setProcessedImage(url);
      setSliderPosition(50);
    } catch (error) {
      console.error('Error removing background:', error);
      alert('Error processing image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSliderChange = (e) => {
    setSliderPosition(e.target.value);
  };

  const downloadImage = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = 'removed-background.png';
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Tools
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Background Remover</h1>
          <p className="text-gray-600">Remove background from your images with AI</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {!processedImage ? (
            <div className="flex flex-col items-center justify-center">
              <div
                className={`w-full max-w-2xl h-[400px] border-2 border-dashed rounded-xl transition-all ${
                  selectedFile ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-500'
                } flex flex-col items-center justify-center cursor-pointer`}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {selectedFile ? (
                  <div className="w-full h-full p-4 flex flex-col items-center">
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Original"
                      className="max-h-full object-contain rounded-lg"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      {selectedFile.name}
                    </p>
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <FaCloudUploadAlt className="mx-auto h-16 w-16 text-blue-500 mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      Drop your image here
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Supports JPG, JPEG, PNG (max 5MB)
                    </p>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-input"
                    />
                    <label
                      htmlFor="file-input"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-colors"
                    >
                      Select Image
                    </label>
                  </div>
                )}
              </div>

              {selectedFile && (
                <button
                  onClick={removeBackground}
                  disabled={loading}
                  className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Image...
                    </span>
                  ) : (
                    'Remove Background'
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Image Comparison Slider */}
              <div className="relative w-full max-w-3xl mx-auto h-[500px] overflow-hidden rounded-xl">
                {/* Original Image (Background) */}
                <div className="absolute inset-0">
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Original"
                    className="w-full h-full object-contain"
                  />
                </div>
                
                {/* Processed Image (Foreground) */}
                <div 
                  className="absolute inset-0"
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                  <div 
                    className="w-full h-full"
                    style={{
                      background: `
                        linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
                        linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
                        linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
                        linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
                      `,
                      backgroundSize: '20px 20px',
                      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                      backgroundColor: 'white'
                    }}
                  >
                    <img
                      src={processedImage}
                      alt="Processed"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Slider Line */}
                <div 
                  className="absolute inset-y-0"
                  style={{ 
                    left: `${sliderPosition}%`,
                    width: '2px',
                    backgroundColor: 'white',
                    boxShadow: '0 0 10px rgba(0,0,0,0.3)'
                  }}
                >
                  {/* Slider Handle */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center cursor-ew-resize"
                    style={{ left: '1px' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M8 5L3 10L8 15" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 5L21 10L16 15" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={handleSliderChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                />

                {/* Labels */}
                <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  Original
                </div>
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  No Background
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    setProcessedImage(null);
                    setSelectedFile(null);
                  }}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Process New Image
                </button>
                <button
                  onClick={downloadImage}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Download Result
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackgroundRemover;
