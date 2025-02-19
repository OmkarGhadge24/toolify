import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const ConverterCard = ({ converter, onClick }) => {
  const Icon = converter.icon;
  const { theme } = useTheme();
  
  return (
    <div
      className={`rounded-lg shadow-md p-6 cursor-pointer transition-transform hover:scale-105 ${
        theme === "light" 
          ? "bg-white" 
          : "bg-[#1a1b2e]"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
          theme === "light"
            ? "bg-[#3B40E8]/10"
            : "bg-[#3B40E8]/20"
        }`}>
          <Icon className="w-6 h-6 text-[#3B40E8]" />
        </div>
        <h3 className={`text-lg font-semibold ${
          theme === "light" ? "text-gray-800" : "text-white"
        }`}>
          {converter.title}
        </h3>
      </div>
      <p className={theme === "light" ? "text-gray-600" : "text-gray-300"}>
        {converter.description}
      </p>
    </div>
  );
};

export default ConverterCard;
