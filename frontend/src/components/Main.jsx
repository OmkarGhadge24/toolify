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
    active: true,
  },
  {
    id: 'file-converter',
    name: 'File Converter',
    description: 'Convert files between different formats',
    icon: FaFileUpload,
    route: '/file-converter',
    active: true,
  },
  {
    id: 'text-extractor',
    name: 'Text Extractor',
    description: 'Extract text from images and documents',
    icon: FaFileAlt,
    route: '/text-extractor',
    active: true,
  },
  {
    id: 'audio-extractor',
    name: 'Audio Extractor',
    description: 'Extract audio from video files',
    icon: FaVideo,
    route: '/audio-extractor',
    active: false,
  },
];

const Main = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* Main Content */}
      <main className="w-full max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className={`flex flex-col items-start bg-white border rounded-lg shadow-sm transition-transform transform hover:scale-105 ${
                !tool.active && 'opacity-70'
              }`}
            >
              <div className="p-6 w-full">
                <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg mb-4">
                  <tool.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {tool.name}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  {tool.description}
                </p>
              </div>
              <div className="w-full mt-auto px-6 pb-6">
                <button
                  onClick={() => tool.active && navigate(tool.route)}
                  className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    tool.active
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {tool.active ? 'Open Tool' : 'Coming Soon'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Main;
