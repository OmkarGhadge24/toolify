const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const archiver = require('archiver');

// Configure multer for temporary file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Initialize ConvertAPI with your secret
const convertapi = require('convertapi')(process.env.CONVERT_API_SECRET);

// Merge PDFs
router.post('/merge', upload.array('files'), async (req, res) => {
  const tempFiles = [];
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: 'Please select at least 2 PDF files to merge' });
    }

    // Store file paths for ConvertAPI
    tempFiles.push(...req.files.map(file => file.path));

    // Convert using ConvertAPI
    const result = await convertapi.convert('merge', {
      Files: tempFiles
    }, 'pdf');

    // Get the result URL and download it
    const fileUrl = result.file.url;
    const response = await fetch(fileUrl);
    const buffer = await response.buffer();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=merged.pdf');
    res.send(buffer);

  } catch (error) {
    console.error('Error in PDF merge process:', error);
    res.status(500).json({ 
      error: 'Failed to merge PDFs',
      details: error.message 
    });
  } finally {
    // Cleanup temporary files
    tempFiles.forEach(filePath => {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Error cleaning up file:', filePath, err);
      }
    });
  }
});

// Split PDF
router.post('/split', upload.single('file'), async (req, res) => {
  let tempFile = null;
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please select a PDF file to split' });
    }

    const splitPage = parseInt(req.body.splitPage);
    if (!splitPage || splitPage < 1) {
      return res.status(400).json({ error: 'Please specify a valid page number to split at' });
    }

    tempFile = req.file.path;

    try {
      // Split PDF using ConvertAPI
      const result = await convertapi.convert('split', {
        File: tempFile,
        SplitByRange: `1-${splitPage},${splitPage + 1}-`
      }, 'pdf');

      // Create a zip file to store split PDFs
      const archive = archiver('zip', {
        zlib: { level: 9 }
      });

      // Set up archive error handling
      archive.on('error', (err) => {
        throw new Error(`Archive error: ${err.message}`);
      });

      // Set response headers for zip file
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename=split_${req.file.originalname.replace('.pdf', '')}.zip`);

      // Pipe archive data to response
      archive.pipe(res);

      // Download and add all split PDFs to zip
      for (let i = 0; i < result.files.length; i++) {
        const fileUrl = result.files[i].url;
        const response = await fetch(fileUrl);
        const buffer = await response.buffer();
        archive.append(buffer, { name: `part${i + 1}.pdf` });
      }

      // Finalize zip file
      await archive.finalize();

    } catch (convError) {
      console.error('ConvertAPI or Archive Error:', convError);
      throw new Error(`PDF processing failed: ${convError.message}`);
    }

  } catch (error) {
    console.error('Error in PDF split process:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Failed to split PDF',
        details: error.message 
      });
    }
  } finally {
    // Cleanup temporary file
    if (tempFile) {
      try {
        fs.unlinkSync(tempFile);
      } catch (err) {
        console.error('Error cleaning up file:', tempFile, err);
      }
    }
  }
});

module.exports = router;