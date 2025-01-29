import React, { useState } from 'react';
import { FaFilePdf, FaFileWord, FaFileImage, FaFileExcel, FaFileAlt} from 'react-icons/fa';
import ConverterCard from '../components/converters/ConverterCard';
import ConversionArea from '../components/converters/ConversionArea';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const converters = [
  // PDF Conversions
  {
    id: 'pdf-to-word',
    title: 'PDF to Word',
    description: 'Convert PDF files to editable Word documents with high accuracy',
    icon: FaFileWord,
    fromFormat: 'PDF',
    toFormat: 'WORD',
    isActive: true,
  },
  {
    id: 'pdf-to-image',
    title: 'PDF to Image',
    description: 'Convert PDF pages to JPG or PNG images',
    icon: FaFileImage,
    fromFormat: 'PDF',
    toFormat: 'PNG',
    isActive: true,
  },
  {
    id: 'pdf-to-text',
    title: 'PDF to Text',
    description: 'Extract text content from PDF files',
    icon: FaFileAlt,
    fromFormat: 'PDF',
    toFormat: 'TXT',
    isActive: true,
  },
  // Word Conversions
  {
    id: 'word-to-pdf',
    title: 'Word to PDF',
    description: 'Convert Word documents to PDF format with perfect formatting',
    icon: FaFilePdf,
    fromFormat: 'WORD',
    toFormat: 'PDF',
    isActive: true,
  },
  // Excel Conversions
  {
    id: 'excel-to-pdf',
    title: 'Excel to PDF',
    description: 'Convert Excel spreadsheets to PDF format',
    icon: FaFileExcel,
    fromFormat: 'XLSX',
    toFormat: 'PDF',
    isActive: true,
  },
  // Image Conversions
  {
    id: 'image-to-pdf',
    title: 'Image to PDF',
    description: 'Convert JPG or PNG images to PDF documents',
    icon: FaFilePdf,
    fromFormat: 'JPG',
    toFormat: 'PDF',
    isActive: true,
  },
  {
    id: 'jpg-to-png',
    title: 'JPG to PNG',
    description: 'Convert JPG images to PNG format',
    icon: FaFileImage,
    fromFormat: 'JPG',
    toFormat: 'PNG',
    isActive: true,
  },
  {
    id: 'png-to-jpg',
    title: 'PNG to JPG',
    description: 'Convert PNG images to JPG format',
    icon: FaFileImage,
    fromFormat: 'PNG',
    toFormat: 'JPG',
    isActive: true,
  },
  {
    id: 'webp-to-jpg',
    title: 'WebP to JPG',
    description: 'Convert WebP images to JPG format',
    icon: FaFileImage,
    fromFormat: 'WEBP',
    toFormat: 'JPG',
    isActive: true,
  },
  {
    id: 'webp-to-png',
    title: 'WebP to PNG',
    description: 'Convert WebP images to PNG format',
    icon: FaFileImage,
    fromFormat: 'WEBP',
    toFormat: 'PNG',
    isActive: true,
  }
];

const FileConverter = () => {
  const [selectedConverter, setSelectedConverter] = useState(null);
  const navigate = useNavigate();

  const handleConvert = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fromFormat', selectedConverter.fromFormat);
    formData.append('toFormat', selectedConverter.toFormat);

    try {
      const response = await fetch('http://localhost:5000/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Conversion failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `converted.${selectedConverter.toFormat.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error during conversion:', error);
      alert(error.message || 'Failed to convert file. Please try again.');
    }
  };

  if (selectedConverter) {
    return (
      <ConversionArea
        fromFormat={selectedConverter.fromFormat}
        toFormat={selectedConverter.toFormat}
        onConvert={handleConvert}
        onBack={() => setSelectedConverter(null)}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 mb-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Tools
          </button>
        </div>
      </div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">File Converter</h1>
        <p className="text-gray-600">Convert your files to any format with ease</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {converters.map((converter) => (
          <ConverterCard
            key={converter.id}
            {...converter}
            onClick={() => setSelectedConverter(converter)}
          />
        ))}
      </div>
    </div>
  );
};

export default FileConverter;
