import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConverterCard from '../components/converters/ConverterCard';
import ConversionArea from '../components/converters/ConversionArea';
import { FaFileImage, FaFileWord, FaFilePdf, FaFilePowerpoint, FaFileExcel, FaFileArchive } from 'react-icons/fa';
import { FaArrowLeft } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

// List of supported converters
const converters = [
  // PDF Conversions
  {
    id: 'pdf-to-docx',
    title: 'PDF to DOCX',
    description: 'Convert PDF files to editable Word documents',
    fromFormat: 'PDF',
    toFormat: 'DOCX',
    allowMultiple: false,
    icon: FaFileWord
  },
  {
    id: 'pdf-to-pptx',
    title: 'PDF to PPTX',
    description: 'Convert PDF files to PowerPoint presentations',
    fromFormat: 'PDF',
    toFormat: 'PPTX',
    allowMultiple: false,
    icon: FaFilePowerpoint
  },
  {
    id: 'pdf-to-excel',
    title: 'PDF to Excel',
    description: 'Convert PDF files to Excel spreadsheets',
    fromFormat: 'PDF',
    toFormat: 'XLSX',
    allowMultiple: false,
    icon: FaFileExcel
  },
  // Word Conversions
  {
    id: 'docx-to-pdf',
    title: 'DOCX to PDF',
    description: 'Convert Word documents to PDF files',
    fromFormat: 'DOCX',
    toFormat: 'PDF',
    allowMultiple: false,
    icon: FaFilePdf
  },
  // PowerPoint Conversions
  {
    id: 'pptx-to-pdf',
    title: 'PowerPoint to PDF',
    description: 'Convert PowerPoint presentations to PDF',
    fromFormat: 'PPTX',
    toFormat: 'PDF',
    allowMultiple: false,
    icon: FaFilePdf
  },
  // Excel Conversions
  {
    id: 'excel-to-pdf',
    title: 'Excel to PDF',
    description: 'Convert Excel spreadsheets to PDF format',
    fromFormat: 'XLSX',
    toFormat: 'PDF',
    allowMultiple: false,
    icon: FaFilePdf
  },
  {
    id: 'pdf-to-jpg',
    title: 'PDF to JPG',
    description: 'Convert PDF pages to JPG images',
    fromFormat: 'PDF',
    toFormat: 'JPG',
    allowMultiple: false,
    icon: FaFileImage
  },
  // Image Conversions
  {
    id: 'jpg-to-png',
    title: 'JPG to PNG',
    description: 'Convert JPG images to PNG format',
    fromFormat: 'JPG',
    toFormat: 'PNG',
    allowMultiple: false,
    icon: FaFileImage
  },
  {
    id: 'png-to-jpg',
    title: 'PNG to JPG',
    description: 'Convert PNG images to JPG format',
    fromFormat: 'PNG',
    toFormat: 'JPG',
    allowMultiple: false,
    icon: FaFileImage
  },
  {
    id: 'webp-to-jpg',
    title: 'WebP to JPG',
    description: 'Convert WebP images to JPG format',
    fromFormat: 'WEBP',
    toFormat: 'JPG',
    allowMultiple: false,
    icon: FaFileImage
  },
  {
    id: 'webp-to-png',
    title: 'WebP to PNG',
    description: 'Convert WebP images to PNG format',
    fromFormat: 'WEBP',
    toFormat: 'PNG',
    allowMultiple: false,
    icon: FaFileImage
  },
  // Archive Creation
  {
    id: 'create-zip',
    title: 'Create ZIP Archive',
    description: 'Select multiple files to create a ZIP archive',
    fromFormat: 'FILES',
    toFormat: 'ZIP',
    allowMultiple: true,
    icon: FaFileArchive
  }
];

// Format extensions mapping for downloads
const FORMAT_EXTENSIONS = {
  'PDF': 'pdf',
  'DOCX': 'docx',
  'DOC': 'doc',
  'XLSX': 'xlsx',
  'JPG': 'jpg',
  'JPEG': 'jpg',
  'PNG': 'png',
  'WEBP': 'webp',
  'PPTX': 'pptx',
  'ZIP': 'zip'
};

const FileConverter = () => {
  const [selectedConverter, setSelectedConverter] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleConvert = async (files) => {
    if (!files || files.length === 0) {
      throw new Error('Please select at least one file');
    }

    const formData = new FormData();
    
    // Handle multiple files for ZIP creation
    if (selectedConverter.allowMultiple) {
      files.forEach(file => {
        formData.append('Files', file);
      });
    } else {
      // For single file conversions, only use the first file
      formData.append('file', files[0]);
    }
    
    formData.append('fromFormat', selectedConverter.fromFormat);
    formData.append('toFormat', selectedConverter.toFormat);

    try {
      const headers = {};
      if (selectedConverter.allowMultiple) {
        headers['X-Conversion-Type'] = 'zip';
      }

      const response = await fetch('http://localhost:5000/api/convert', {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Conversion failed');
        } else {
          throw new Error('Conversion failed');
        }
      }

      const contentType = response.headers.get('content-type');
      
      // Handle PDF to JPG response which returns JSON with base64 data
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json();
        // Download each JPG file
        result.files.forEach(file => {
          const blob = new Blob([Uint8Array.from(atob(file.data), c => c.charCodeAt(0))], { type: 'image/jpeg' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = file.fileName;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        });
      } else {
        // Handle regular single file or ZIP conversions
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        if (selectedConverter.allowMultiple) {
          a.download = 'archive.zip';
        } else {
          const originalName = files[0].name.split('.')[0];
          const extension = FORMAT_EXTENSIONS[selectedConverter.toFormat] || selectedConverter.toFormat.toLowerCase();
          a.download = `${originalName}.${extension}`;
        }
        
        a.href = url;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error during conversion:', error);
      throw error;
    }
  };

  return (
    <div className={`min-h-screen ${
      theme === "light" ? "bg-gray-50" : "bg-[#151623]"
    }`}>
      {/* Header */}
      <div className={`${
        theme === "light" 
          ? "bg-white shadow-sm" 
          : "bg-[#1a1b2e] shadow-sm"
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          {selectedConverter ? (
            <button
              onClick={() => setSelectedConverter(null)}
              className={`flex items-center transition-colors ${
                theme === "light"
                  ? "text-gray-600 hover:text-gray-900"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <FaArrowLeft className="mr-2" />
              Back to Converters
            </button>
          ) : (
            <button
              onClick={() => navigate("/")}
              className={`flex items-center transition-colors ${
                theme === "light"
                  ? "text-gray-600 hover:text-gray-900"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <FaArrowLeft className="mr-2" />
              Back to Tools
            </button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {selectedConverter ? (
          <div>
            <ConversionArea
              converter={selectedConverter}
              onConvert={handleConvert}
              allowMultiple={selectedConverter.allowMultiple}
            />
          </div>
        ) : (
          <div>
            <h1 className={`text-3xl font-bold mb-8 text-center ${
              theme === "light" ? "text-gray-800" : "text-white"
            }`}>
              File Converter
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {converters.map((converter) => (
                <ConverterCard
                  key={converter.id}
                  converter={converter}
                  onClick={() => {
                    setSelectedConverter(converter);
                    setSelectedFiles([]);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileConverter;
