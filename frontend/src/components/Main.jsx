import React from 'react';
import { Link } from 'react-router-dom';
import { FaTools, FaArrowRight } from 'react-icons/fa';

const tools = [
  { name: 'Tool 1', description: 'Description for tool 1', route: '/tool/tool1'},
  { name: 'Tool 2', description: 'Description for tool 2', route: '/tool/tool2'},
  { name: 'Tool 3', description: 'Description for tool 3', route: '/tool/tool3'},
  { name: 'Tool 4', description: 'Description for tool 4', route: '/tool/tool4'},
  { name: 'Tool 5', description: 'Description for tool 5', route: '/tool/tool5'},
];

const Main = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool, index) => (
            <div
              key={index}
              className="bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition-all duration-200"
            >
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3">
                <div className="text-white w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <FaTools />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
                <Link
                  to={tool.route}
                  className="inline-flex items-center text-sm px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 group"
                >
                  <span>Open Tool</span>
                  <FaArrowRight className="ml-2 text-xs group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Main;
