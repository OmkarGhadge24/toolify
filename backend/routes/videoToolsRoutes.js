const express = require('express');
const multer = require('multer');
const { extractAudio, processVideo } = require('../controllers/videoToolsController');

const router = express.Router();

// Configure multer for video file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/videos');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Not a video file!'), false);
        }
    }
});

// Routes
router.post('/extract-audio', upload.single('video'), extractAudio);
router.post('/process-video', upload.single('video'), processVideo);

module.exports = router;
