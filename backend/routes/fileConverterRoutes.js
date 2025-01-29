const express = require('express');
const multer = require('multer');
const { convertFile } = require('../controllers/fileConverterController');

const router = express.Router();

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Custom middleware to handle file uploads
const handleFileUpload = (req, res, next) => {
  const isZipConversion = req.headers['x-conversion-type'] === 'zip';
  
  if (isZipConversion) {
    // For ZIP conversion, use array to handle multiple files
    const arrayUpload = upload.array('Files', 10); // Allow up to 10 files
    arrayUpload(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  } else {
    // For single file conversions
    const singleUpload = upload.single('file');
    singleUpload(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({ error: err.message });
      }
      // Ensure file was uploaded
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      next();
    });
  }
};

// File conversion route
router.post('/convert', handleFileUpload, convertFile);

module.exports = router;
