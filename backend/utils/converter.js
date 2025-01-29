const fs = require('fs').promises;
const path = require('path');
const ConvertAPI = require('convertapi')(process.env.CONVERT_API_SECRET);
require('dotenv').config();

// Format extensions mapping
const FORMAT_EXTENSIONS = {
  'PDF': '.pdf',
  'DOCX': '.docx',
  'DOC': '.doc',
  'XLSX': '.xlsx',
  'JPG': '.jpg',
  'JPEG': '.jpg',
  'PNG': '.png',
  'WEBP': '.webp',
  'PPTX': '.pptx',
  'ZIP': '.zip'
};

// Format mapping for ConvertAPI
const CONVERT_API_FORMAT_MAP = {
  'PDF': 'pdf',
  'DOCX': 'docx',
  'DOC': 'doc',
  'XLSX': 'xlsx',
  'JPG': 'jpg',
  'JPEG': 'jpg',
  'PNG': 'png',
  'WEBP': 'webp',
  'PPTX': 'pptx',
  'ZIP': 'zip',
  'FILES': 'any'
};

// Supported conversion pairs
const SUPPORTED_CONVERSIONS = {
  'PDF': ['DOCX', 'JPG', 'PPTX', 'XLSX'],
  'DOCX': ['PDF'],
  'PPTX': ['PDF'],
  'XLSX': ['PDF'],
  'JPG': ['PNG'],
  'PNG': ['JPG'],
  'WEBP': ['JPG', 'PNG'],
  'FILES': ['ZIP']
};

// Helper function to get file extension for a format
exports.getExtensionForFormat = (format) => {
  format = format.toUpperCase();
  const extension = FORMAT_EXTENSIONS[format];
  if (!extension) {
    throw new Error(`Unsupported format: ${format}`);
  }
  return extension;
};

// Helper function to check if format is supported
exports.isFormatSupported = (format) => {
  return format.toUpperCase() === 'FILES' || !!CONVERT_API_FORMAT_MAP[format.toUpperCase()];
};

// Helper function to check if conversion is supported
exports.isConversionSupported = (fromFormat, toFormat) => {
  fromFormat = fromFormat.toUpperCase();
  toFormat = toFormat.toUpperCase();
  return SUPPORTED_CONVERSIONS[fromFormat]?.includes(toFormat);
};

// Convert a file using ConvertAPI
exports.convertFile = async (inputPath, outputPath, fromFormat, toFormat) => {
  try {
    const fromApiFormat = CONVERT_API_FORMAT_MAP[fromFormat.toUpperCase()];
    const toApiFormat = CONVERT_API_FORMAT_MAP[toFormat.toUpperCase()];

    if (!fromApiFormat || !toApiFormat) {
      throw new Error('Unsupported format');
    }

    let params = { File: inputPath };

    // Special handling for PDF to Excel conversion
    if (fromFormat.toUpperCase() === 'PDF' && toFormat.toUpperCase() === 'XLSX') {
      params = {
        File: inputPath,
        PageRange: '1-2000',
        WorksheetName: 'Sheet1',
        ParseOptions: JSON.stringify({
          "ParseType": "Table",
          "ExportHiddenContent": true,
          "AutoDetectSeparators": true,
          "RemoveEmptyRows": true,
          "SkipPdfErrors": true
        })
      };
    }

    // Convert the file
    console.log('Starting conversion with params:', JSON.stringify(params, null, 2));
    const result = await ConvertAPI.convert(toApiFormat, params, fromApiFormat);

    // Download the converted file
    await result.file.save(outputPath);
    console.log('Conversion completed successfully');

    return {
      filePath: outputPath,
      fileSize: (await fs.stat(outputPath)).size
    };
  } catch (error) {
    console.error('ConvertAPI Error:', error);
    const errorResponse = error.response?.data;
    const errorCode = errorResponse?.Code;
    const errorMessage = errorResponse?.Message || error.message;

    // Handle specific error codes
    switch (errorCode) {
      case 5001:
        if (errorMessage.toLowerCase().includes('password')) {
          throw new Error('The PDF file appears to be encrypted or password protected. Please provide an unprotected PDF.');
        } else {
          throw new Error('Unable to read the PDF content. The file might be corrupted or contain unsupported content.');
        }
      case 4000:
        throw new Error('Invalid conversion parameters. Please try with a simpler PDF file.');
      case 4001:
        throw new Error('The PDF file might be too complex or contain unsupported elements.');
      default:
        if (errorMessage.toLowerCase().includes('timeout')) {
          throw new Error('The conversion took too long. Please try with a smaller or simpler PDF file.');
        } else {
          throw new Error('Conversion failed: ' + (errorMessage || 'Unknown error'));
        }
    }
  }
};

// Create a ZIP archive from multiple files
exports.createZipArchive = async (files, outputPath) => {
  try {
    const result = await ConvertAPI.convert('zip', {
      Files: files.map(file => file.buffer)
    });

    await result.file.save(outputPath);

    return {
      filePath: outputPath,
      fileSize: (await fs.stat(outputPath)).size
    };
  } catch (error) {
    console.error('ZIP Creation Error:', error);
    throw new Error('Failed to create ZIP archive: ' + (error.message || 'Unknown error'));
  }
};