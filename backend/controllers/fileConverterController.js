const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;
const multer = require('multer');
const converter = require('../utils/converter');

// Ensure temp directory exists
const ensureTempDir = async () => {
  const tempDir = path.join(__dirname, '../temp');
  try {
    await fsPromises.access(tempDir);
  } catch {
    await fsPromises.mkdir(tempDir, { recursive: true });
  }
  return tempDir;
};

// Cleanup temp files
const cleanupTempFiles = async (...files) => {
  for (const file of files) {
    try {
      await fsPromises.unlink(file);
    } catch (error) {
      console.error(`Error deleting temp file ${file}:`, error);
    }
  }
};

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Handle file conversion
exports.convertFile = async (req, res) => {
  const tempFiles = [];
  let tempDir;

  try {
    // Ensure temp directory exists
    tempDir = await ensureTempDir();

    const { fromFormat, toFormat } = req.body;
    
    if (!fromFormat || !toFormat) {
      throw new Error('From and To formats are required');
    }

    // Validate formats are supported
    if (!converter.isFormatSupported(fromFormat)) {
      throw new Error(`Unsupported input format: ${fromFormat}`);
    }
    if (!converter.isFormatSupported(toFormat)) {
      throw new Error(`Unsupported output format: ${toFormat}`);
    }

    // Check if conversion is supported
    if (!converter.isConversionSupported(fromFormat, toFormat)) {
      throw new Error(`Conversion from ${fromFormat} to ${toFormat} is not supported`);
    }

    // Special handling for ZIP archive creation
    if (fromFormat === 'FILES' && toFormat === 'ZIP') {
      if (!req.files || !Array.isArray(req.files) || req.files.length < 2) {
        throw new Error('At least two files are required for ZIP archive creation');
      }

      // Create output path for ZIP
      const outputPath = path.join(tempDir, `archive_${Date.now()}.zip`);
      tempFiles.push(outputPath);

      try {
        // Create ZIP archive
        const result = await converter.createZipArchive(req.files, outputPath);
        
        // Send ZIP file
        res.download(result.filePath, 'archive.zip', async (err) => {
          if (err) {
            console.error('Error sending file:', err);
            if (!res.headersSent) {
              res.status(500).json({ error: 'Error sending ZIP file' });
            }
          }
          await cleanupTempFiles(...tempFiles);
        });
      } catch (error) {
        console.error('ZIP creation error:', error);
        throw new Error('Failed to create ZIP archive');
      }
      return;
    }

    // Handle single file conversions
    if (!req.file) {
      throw new Error('No file uploaded');
    }

    // Validate file extension
    const fileExt = path.extname(req.file.originalname).slice(1).toLowerCase();
    if (fileExt !== fromFormat.toLowerCase()) {
      throw new Error(`Invalid file format. Expected ${fromFormat} but received ${fileExt}`);
    }

    // Create temp file paths
    const inputPath = path.join(tempDir, `input_${Date.now()}.${fileExt}`);
    const outputPath = path.join(tempDir, `output_${Date.now()}.${toFormat.toLowerCase()}`);
    tempFiles.push(inputPath, outputPath);

    try {
      // Write uploaded file to temp location
      await fsPromises.writeFile(inputPath, req.file.buffer);

      // Special handling for PDF to Excel
      if (fromFormat.toUpperCase() === 'PDF' && toFormat.toUpperCase() === 'XLSX') {
        console.log('Converting PDF to Excel...');
        console.log('Input file size:', req.file.size);
        console.log('Input file path:', inputPath);
      }

      // Perform conversion
      const result = await converter.convertFile(inputPath, outputPath, fromFormat, toFormat);
      
      // Send converted file
      const fileName = path.basename(req.file.originalname, path.extname(req.file.originalname));
      res.download(result.filePath, `${fileName}.${toFormat.toLowerCase()}`, async (err) => {
        if (err) {
          console.error('Error sending file:', err);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Error sending converted file' });
          }
        }
        await cleanupTempFiles(...tempFiles);
      });
    } catch (error) {
      console.error('Conversion error:', error);
      if (error.message.includes('password protected')) {
        throw new Error('Cannot convert password-protected PDF files. Please remove the password protection and try again.');
      } else if (error.message.includes('unrecognizable content')) {
        throw new Error('The PDF content could not be properly extracted. The file might be scanned or contain complex formatting.');
      }
      throw new Error('File conversion failed: ' + error.message);
    }
  } catch (error) {
    console.error('Controller error:', error);
    if (!res.headersSent) {
      res.status(400).json({ error: error.message });
    }
    await cleanupTempFiles(...tempFiles);
  }
};

// Configure multer middleware
exports.upload = upload;
