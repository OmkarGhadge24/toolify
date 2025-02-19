import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaImage, FaFileAlt, FaVideo, FaFileUpload, FaMusic, FaFilePdf } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

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
    id:'video-to-audio',
    name: 'Video to Audio',
    description: 'Convert videos to audio',
    icon: FaMusic,
    route: '/video-to-audio',
    active: true,
  },
  {
    id:'video-editor',
    name: 'Video Editor',
    description: 'Edit video quality, FPS, and more',
    icon: FaVideo,
    route: '/video-editor',
    active: true,
  },
  {
    id:'pdf-editor',
    name: 'Pdf Editor',
    description: 'Edit pdf files, merge and split',
    icon: FaFilePdf,
    route: '/pdf-editor',
    active: true,
  }
];

const Main = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col items-center rounded-lg ${
      theme === "light" ? "bg-gray-50" : "bg-[#151623]"
    }`}>
      {/* Main Content */}
      <main className="w-full max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className={`flex flex-col items-start rounded-lg shadow-sm transition-transform transform hover:scale-105 ${
                !tool.active && 'opacity-70'
              } ${
                theme === "light" 
                  ? "bg-white border" 
                  : "bg-[#1a1b2e] border-[#252942]"
              }`}
            >
              <div className="p-6 w-full">
                <div className={`w-12 h-12 flex items-center justify-center rounded-lg mb-4 ${
                  theme === "light"
                    ? "bg-[#3B40E8]/10"
                    : "bg-[#3B40E8]/20"
                }`}>
                  <tool.icon className="w-6 h-6 text-[#3B40E8]" />
                </div>
                <h2 className={`text-lg font-semibold ${
                  theme === "light" ? "text-gray-800" : "text-white"
                }`}>
                  {tool.name}
                </h2>
                <p className={`mt-2 text-sm ${
                  theme === "light" ? "text-gray-600" : "text-gray-300"
                }`}>
                  {tool.description}
                </p>
              </div>
              <div className="w-full mt-auto px-6 pb-6">
                <button
                  onClick={() => tool.active && navigate(tool.route)}
                  className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    tool.active
                      ? 'bg-[#3B40E8] text-white hover:bg-[#2D31B3]'
                      : theme === "light"
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-[#252942] text-gray-400 cursor-not-allowed'
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
