const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');
const { convertDocument, getExtensionForFormat, isFormatSupported, createZipArchive } = require('../utils/converter');

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Helper function to create temp directory if it doesn't exist
const ensureTempDir = async () => {
  const tempDir = path.join(__dirname, '../temp');
  try {
    await fs.access(tempDir);
  } catch {
    await fs.mkdir(tempDir, { recursive: true });
  }
  return tempDir;
};

// Helper function to clean up temp files
const cleanupTempFiles = async (...files) => {
  for (const file of files) {
    try {
      if (file && await fs.access(file).then(() => true).catch(() => false)) {
        await fs.unlink(file);
      }
    } catch (error) {
      console.error(`Error cleaning up temp file ${file}:`, error);
    }
  }
};

exports.convertFile = async (req, res) => {
  const { fromFormat, toFormat } = req.body;
  const tempFiles = [];

  try {
    if (!fromFormat || !toFormat) {
      throw new Error('From format and to format are required');
    }

    // Validate formats
    if (!isFormatSupported(fromFormat) || !isFormatSupported(toFormat)) {
      throw new Error('Unsupported format');
    }

    // Ensure temp directory exists
    const tempDir = await ensureTempDir();

    // Special handling for ZIP archive creation
    if (fromFormat === 'FILES' && toFormat === 'ZIP') {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw new Error('Multiple files are required for ZIP archive creation');
      }

      // Create output path for ZIP
      const outputPath = path.join(tempDir, `archive_${Date.now()}.zip`);
      tempFiles.push(outputPath);

      try {
        // Create ZIP archive by passing raw files
        const result = await createZipArchive(req.files, outputPath);
        
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
        if (!res.headersSent) {
          res.status(500).json({ error: error.message });
        }
        await cleanupTempFiles(...tempFiles);
      }
      return;
    }

    // Handle regular file conversion
    if (!req.file) {
      throw new Error('No file uploaded');
    }

    // Validate file format matches fromFormat
    const fileExt = path.extname(req.file.originalname).toLowerCase().substring(1);
    const expectedExt = getExtensionForFormat(fromFormat).toLowerCase().substring(1);
    if (fileExt !== expectedExt) {
      throw new Error(`Invalid file format. Expected ${fromFormat} file but received .${fileExt}`);
    }

    // Save uploaded file
    const inputPath = path.join(tempDir, `input_${Date.now()}_${req.file.originalname}`);
    await fs.writeFile(inputPath, req.file.buffer);
    tempFiles.push(inputPath);

    // Special handling for PDF to JPG conversion
    if (fromFormat === 'PDF' && toFormat === 'JPG') {
      const result = await convertDocument(inputPath, null, fromFormat, toFormat);
      
      // Create a response with all JPG files
      const responseFiles = await Promise.all(result.files.map(async (file) => {
        const fileData = await fs.readFile(file.filePath);
        tempFiles.push(file.filePath);
        return {
          fileName: file.fileName,
          data: fileData.toString('base64'),
          fileSize: file.fileSize
        };
      }));

      res.json({ files: responseFiles });
      await cleanupTempFiles(...tempFiles);
      return;
    }

    // Regular conversion
    const outputPath = path.join(tempDir, `output_${Date.now()}_${req.file.originalname}`);
    tempFiles.push(outputPath);

    try {
      // Convert file
      const result = await convertDocument(inputPath, outputPath, fromFormat, toFormat);
      
      // Send converted file
      res.download(result.filePath, `converted${getExtensionForFormat(toFormat)}`, async (err) => {
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
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      }
      await cleanupTempFiles(...tempFiles);
    }

  } catch (error) {
    console.error('Conversion error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
    await cleanupTempFiles(...tempFiles);
  }
};

// Configure multer middleware
exports.upload = upload;
