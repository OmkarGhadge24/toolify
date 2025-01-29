const express = require('express');
const router = express.Router();
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 500 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG and PNG files are allowed'));
        }
    }
});

router.post('/text-extractor/extract-text', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const formData = new FormData();
        formData.append('image', fs.createReadStream(req.file.path));
        
        const response = await axios.post('https://api.api-ninjas.com/v1/imagetotext', 
            formData,
            {
                headers: {
                    'X-Api-Key': process.env.NINJA_API_KEY,
                    ...formData.getHeaders()
                }
            }
        );

        fs.unlink(req.file.path, (err) => {
            if (err) console.error('Error deleting temp file:', err);
        });

        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            const extractedText = response.data
                .sort((a, b) => a.y - b.y || a.x - b.x)
                .map(item => item.text)
                .join(' ');
            
            res.json({ text: extractedText });
        } else {
            res.status(400).json({ 
                error: 'No text found in the image',
                details: 'Please make sure the image contains clear, readable text'
            });
        }
    } catch (error) {
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting temp file:', err);
            });
        }

        if (error.response?.status === 402) {
            res.status(402).json({ error: 'API quota exceeded' });
        } else if (error.response?.status === 401) {
            res.status(401).json({ error: 'Invalid API key' });
        } else if (error.response?.status === 400) {
            res.status(400).json({ 
                error: 'Invalid request',
                details: 'Please ensure your image is in JPEG or PNG format and under 500KB'
            });
        } else {
            res.status(500).json({ 
                error: 'Error processing file',
                details: error.response?.data?.error || error.message 
            });
        }
    }
});

module.exports = router;
