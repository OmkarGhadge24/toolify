import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaImage, FaFileAlt, FaVideo, FaFileUpload } from 'react-icons/fa';

const tools = [
  { 
    id: 'bg-remover',
    name: 'Background Remover', 
    description: 'Remove background from any image instantly',
    icon: FaImage,
    route: '/background-remover',
    active: true
  },
  { 
    id: 'file-converter',
    name: 'File Converter', 
    description: 'Convert files between different formats',
    icon: FaFileUpload,
    route: '/file-converter',
    active: false
  },
  { 
    id: 'text-extractor',
    name: 'Text Extractor', 
    description: 'Extract text from images and documents',
    icon: FaFileAlt,
    route: '/text-extractor',
    active: false
  },
  { 
    id: 'audio-extractor',
    name: 'Audio Extractor', 
    description: 'Extract audio from video files',
    icon: FaVideo,
    route: '/audio-extractor',
    active: false
  },
];

const Main = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            Toolify - Your Ultimate Utility Tools Platform
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xl text-gray-600">
            Professional tools to enhance your workflow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className={`bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${
                !tool.active && 'opacity-60'
              }`}
            >
              <div className="p-8">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <tool.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {tool.name}
                </h3>
                <p className="text-gray-600 mb-6">
                  {tool.description}
                </p>
                <button
                  onClick={() => tool.active && navigate(tool.route)}
                  className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                    tool.active
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {tool.active ? 'Open Tool' : 'Coming Soon'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Main;
