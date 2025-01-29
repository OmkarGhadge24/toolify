const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { convertFile } = require('../controllers/fileConverterController');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// File conversion route
router.post('/convert', upload.single('file'), convertFile);

module.exports = router;
