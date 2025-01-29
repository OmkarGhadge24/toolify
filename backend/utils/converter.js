const ConvertAPI = require('convertapi');
const { promises: fs } = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize ConvertAPI with your secret
const convertapi = new ConvertAPI(process.env.CONVERT_API_SECRET);

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
  'ZIP': 'zip'
};

// Supported conversion pairs
const SUPPORTED_CONVERSIONS = [
  // PDF Conversions
  { from: 'PDF', to: 'DOCX' },
  { from: 'PDF', to: 'XLSX' },
  { from: 'PDF', to: 'PPTX' },
  { from: 'PDF', to: 'JPG' },
  
  // Office to PDF
  { from: 'DOCX', to: 'PDF' },
  { from: 'XLSX', to: 'PDF' },
  { from: 'PPTX', to: 'PDF' },
  
  // Image Conversions
  { from: 'JPG', to: 'PNG' },
  { from: 'PNG', to: 'JPG' },
  { from: 'WEBP', to: 'JPG' },
  { from: 'WEBP', to: 'PNG' },
  
  // Special Conversions
  { from: 'FILES', to: 'ZIP' }
];

// Helper function to get file extension for a format
exports.getExtensionForFormat = (format) => {
  format = format.toUpperCase();
  const extension = FORMAT_EXTENSIONS[format];
  if (!extension) {
    throw new Error(`Unsupported format: ${format}`);
  }
  return extension;
};

// Helper function to get ConvertAPI format
const getConvertApiFormat = (format) => {
  format = format.toUpperCase();
  const apiFormat = CONVERT_API_FORMAT_MAP[format];
  if (!apiFormat) {
    throw new Error(`Unsupported format: ${format}`);
  }
  return apiFormat;
};

// Helper function to check if conversion is supported
const isConversionSupported = (fromFormat, toFormat) => {
  return SUPPORTED_CONVERSIONS.some(
    conv => conv.from === fromFormat.toUpperCase() && conv.to === toFormat.toUpperCase()
  );
};

// Function to create ZIP archive from multiple files
exports.createZipArchive = async (files, outputPath) => {
  try {
    console.log('Creating ZIP archive');
    
    // Validate input files
    if (!files || files.length === 0) {
      throw new Error('No files provided for ZIP archive');
    }

    // Create an array of file objects for ConvertAPI
    const filePromises = files.map(async (file, index) => {
      // Save file to temp location
      const tempPath = path.join(path.dirname(outputPath), `temp_${index}_${file.originalname}`);
      await fs.writeFile(tempPath, file.buffer);
      return tempPath;
    });

    const filePaths = await Promise.all(filePromises);

    // Create ZIP archive using ConvertAPI exactly as in documentation
    const result = await convertapi.convert('zip', {
      Files: filePaths,
      StoreFile: false,
      CompressionLevel: 'NoCompression'
    }, 'any');

    // Save the ZIP file
    await result.file.save(outputPath);

    // Cleanup temp files
    for (const tempPath of filePaths) {
      try {
        await fs.unlink(tempPath);
      } catch (error) {
        console.error(`Error cleaning up temp file ${tempPath}:`, error);
      }
    }

    return { filePath: outputPath };
  } catch (error) {
    console.error('ZIP creation error:', error);
    throw new Error(`ZIP archive creation failed: ${error.message}`);
  }
};

// Main conversion function using ConvertAPI
exports.convertDocument = async (inputPath, outputPath, fromFormat, toFormat) => {
  try {
    console.log(`Converting from ${fromFormat} to ${toFormat}`);
    
    // Validate formats
    if (!isConversionSupported(fromFormat, toFormat)) {
      throw new Error(`Conversion from ${fromFormat} to ${toFormat} is not supported`);
    }

    // Ensure input file exists
    try {
      await fs.access(inputPath);
    } catch (error) {
      throw new Error(`Input file not found: ${inputPath}`);
    }
    
    // Special handling for PDF to JPG conversion
    if (fromFormat === 'PDF' && toFormat === 'JPG') {
      const result = await convertapi.convert('jpg', {
        File: inputPath,
        StoreFile: false,
        ImageQuality: 90,
        ScaleImage: true,
        ScaleProportions: true
      }, 'pdf');
      
      // Save all JPG files locally
      const files = await Promise.all(result.files.map(async (file, index) => {
        const fileName = `page_${index + 1}.jpg`;
        const filePath = path.join(path.dirname(inputPath), fileName);
        await file.save(filePath);
        
        return {
          fileName,
          filePath,
          fileSize: file.fileSize
        };
      }));
      
      return { files };
    }
    
    // Regular conversion
    const fromApiFormat = getConvertApiFormat(fromFormat);
    const toApiFormat = getConvertApiFormat(toFormat);
    
    const result = await convertapi.convert(toApiFormat, {
      File: inputPath,
      StoreFile: false,
      ImageQuality: 'better',
      DocumentQuality: 'better'
    }, fromApiFormat);

    // Save the converted file
    await result.file.save(outputPath);
    return { filePath: outputPath };
  } catch (error) {
    console.error('Conversion error:', error);
    throw new Error(`File conversion failed: ${error.message}`);
  }
};

// Helper function to check if format is supported
exports.isFormatSupported = (format) => {
  return !!CONVERT_API_FORMAT_MAP[format.toUpperCase()];
};