import React, { useState } from 'react';
import { FaFilePdf, FaFileWord, FaFileImage, FaFileExcel, FaFileAlt, FaFilePowerpoint, FaFileArchive } from 'react-icons/fa';
import ConverterCard from '../components/converters/ConverterCard';
import ConversionArea from '../components/converters/ConversionArea';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const converters = [
  // PDF Conversions
  {
    id: 'pdf-to-jpg',
    title: 'PDF to JPG',
    description: 'Convert PDF pages to JPG images',
    icon: FaFileImage,
    fromFormat: 'PDF',
    toFormat: 'JPG',
    isActive: true,
  },
  {
    id: 'pdf-to-word',
    title: 'PDF to Word',
    description: 'Convert PDF files to editable Word documents',
    icon: FaFileWord,
    fromFormat: 'PDF',
    toFormat: 'DOCX',
    isActive: true,
  },
  {
    id: 'pdf-to-pptx',
    title: 'PDF to PowerPoint',
    description: 'Convert PDF files to PowerPoint presentations',
    icon: FaFilePowerpoint,
    fromFormat: 'PDF',
    toFormat: 'PPTX',
    isActive: true,
  },
  {
    id: 'pdf-to-excel',
    title: 'PDF to Excel',
    description: 'Convert PDF files to Excel spreadsheets',
    icon: FaFileExcel,
    fromFormat: 'PDF',
    toFormat: 'XLSX',
    isActive: true,
  },
  // Word Conversions
  {
    id: 'word-to-pdf',
    title: 'Word to PDF',
    description: 'Convert Word documents to PDF format',
    icon: FaFilePdf,
    fromFormat: 'DOCX',
    toFormat: 'PDF',
    isActive: true,
  },
  // PowerPoint Conversions
  {
    id: 'pptx-to-pdf',
    title: 'PowerPoint to PDF',
    description: 'Convert PowerPoint presentations to PDF',
    icon: FaFilePdf,
    fromFormat: 'PPTX',
    toFormat: 'PDF',
    isActive: true,
  },
  // Excel Conversions
  {
    id: 'excel-to-pdf',
    title: 'Excel to PDF',
    description: 'Convert Excel spreadsheets to PDF format',
    icon: FaFilePdf,
    fromFormat: 'XLSX',
    toFormat: 'PDF',
    isActive: true,
  },
  // Image Conversions
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
  },
  // Archive Creation
  {
    id: 'files-to-zip',
    title: 'Create ZIP Archive',
    description: 'Create a ZIP archive from multiple files',
    icon: FaFileArchive,
    fromFormat: 'FILES',
    toFormat: 'ZIP',
    isActive: true,
    allowMultiple: true,  // Special flag for ZIP conversion
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

  const handleConvert = async (files) => {
    if (!files || files.length === 0) {
      throw new Error('Please select at least one file');
    }

    const formData = new FormData();
    
    // Handle multiple files for ZIP conversion
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
    <div className="container mx-auto p-4">
      <button
        onClick={() => navigate('/')}
        className="mb-4 flex items-center text-gray-600 hover:text-gray-800"
      >
        <FaArrowLeft className="mr-2" /> Back to Tools
      </button>
      
      {!selectedConverter ? (
        <div>
          <h1 className="text-2xl font-bold mb-6">File Converter</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {converters.map((converter) => (
              <ConverterCard
                key={converter.id}
                {...converter}
                onClick={() => {
                  setSelectedConverter(converter);
                  setSelectedFiles([]);
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        <ConversionArea
          fromFormat={selectedConverter.fromFormat}
          toFormat={selectedConverter.toFormat}
          onBack={() => {
            setSelectedConverter(null);
            setSelectedFiles([]);
          }}
          onConvert={handleConvert}
          allowMultiple={selectedConverter.allowMultiple}
        />
      )}
    </div>
  );
};

export default FileConverter;
