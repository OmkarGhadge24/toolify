import React from 'react';

const ConverterCard = ({ converter, onClick }) => {
  const Icon = converter.icon;
  
  return (
    <div
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer transition-transform hover:scale-105"
      onClick={onClick}
    >
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold">{converter.title}</h3>
      </div>
      <p className="text-gray-600 text-sm">{converter.description}</p>
    </div>
  );
};

export default ConverterCard;
