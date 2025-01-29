import React from 'react';
import { FaArrowRight } from 'react-icons/fa';

const ConverterCard = ({ icon: Icon, title, description, fromFormat, toFormat, onClick, isActive = true }) => {
  return (
    <div
      onClick={isActive ? onClick : undefined}
      className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ${
        isActive ? 'cursor-pointer transform hover:-translate-y-1' : 'opacity-50 cursor-not-allowed'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-blue-50">
            <Icon className="text-2xl text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <span>{fromFormat}</span>
              <FaArrowRight className="mx-2" />
              <span>{toFormat}</span>
            </div>
          </div>
        </div>
      </div>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
};

export default ConverterCard;
