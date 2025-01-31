const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

// Logger function
const logger = (message, error = null) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
    if (error) {
        console.error(`[${timestamp}] Error details:`, {
            message: error.message,
            stack: error.stack,
            code: error.code,
            details: error
        });
    }
};

// Ensure required directories exist
const ensureDirectories = () => {
    const dirs = ['uploads/videos', 'uploads/audio', 'uploads/processed'];
    dirs.forEach(dir => {
        const fullPath = path.resolve(dir);
        if (!fs.existsSync(fullPath)) {
            logger(`Creating directory: ${fullPath}`);
            fs.mkdirSync(fullPath, { recursive: true });
        }
    });
};

ensureDirectories();

// Validate video file
const validateVideoFile = (file) => {
    logger('Validating video file:', { 
        filename: file?.originalname,
        mimetype: file?.mimetype,
        size: file?.size 
    });

    const validFormats = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-matroska', 'video/webm'];
    return file && validFormats.includes(file.mimetype);
};

// Safe file cleanup
const safeCleanup = (filePath) => {
    if (!filePath) return;
    try {
        if (fs.existsSync(filePath)) {
            logger(`Cleaning up file: ${filePath}`);
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        logger(`Error cleaning up file ${filePath}`, error);
    }
};

// Extract audio from video
exports.extractAudio = async (req, res) => {
    let inputPath, outputPath;

    try {
        logger('Starting audio extraction process');
        
        if (!req.file) {
            logger('No file uploaded');
            return res.status(400).json({ error: 'No video file uploaded' });
        }

        logger('File details:', {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path
        });

        if (!validateVideoFile(req.file)) {
            logger('Invalid video format');
            return res.status(400).json({ error: 'Invalid video format' });
        }

        inputPath = path.resolve(req.file.path);
        outputPath = path.resolve(`uploads/audio/${Date.now()}-audio.mp3`);
        
        logger(`Processing video from ${inputPath} to ${outputPath}`);

        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .toFormat('mp3')
                .on('start', (commandLine) => {
                    logger('FFmpeg process started:', commandLine);
                })
                .on('progress', (progress) => {
                    logger('Processing:', progress);
                })
                .on('error', (err) => {
                    logger('FFmpeg error occurred', err);
                    reject(err);
                })
                .on('end', () => {
                    logger('FFmpeg process completed');
                    resolve();
                })
                .save(outputPath);
        });

        if (!fs.existsSync(outputPath)) {
            throw new Error('Output file was not created');
        }

        const fileStats = fs.statSync(outputPath);
        logger('Output file stats:', {
            size: fileStats.size,
            path: outputPath
        });

        if (fileStats.size === 0) {
            throw new Error('Output file is empty');
        }

        res.download(outputPath, 'extracted-audio.mp3', (err) => {
            if (err) {
                logger('Download error', err);
            } else {
                logger('File downloaded successfully');
            }
            safeCleanup(inputPath);
            safeCleanup(outputPath);
        });

    } catch (error) {
        logger('Error in audio extraction process', error);
        safeCleanup(inputPath);
        safeCleanup(outputPath);
        res.status(500).json({ 
            error: 'Error extracting audio. Please try again.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Process video (quality adjustment and other operations)
exports.processVideo = async (req, res) => {
    let inputPath, outputPath;

    try {
        logger('Starting video processing');

        if (!req.file) {
            logger('No file uploaded');
            return res.status(400).json({ error: 'No video file uploaded' });
        }

        logger('File details:', {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path
        });

        if (!validateVideoFile(req.file)) {
            logger('Invalid video format');
            return res.status(400).json({ error: 'Invalid video format' });
        }

        inputPath = path.resolve(req.file.path);
        outputPath = path.resolve(`uploads/processed/${Date.now()}-processed.mp4`);

        const {
            quality = '720',
            fps = '30',
            bitrate = '1M'
        } = req.body;

        logger('Processing parameters:', { quality, fps, bitrate });

        const validQualities = ['480', '720', '1080'];
        const validFps = ['24', '30', '60'];
        const validBitrates = ['500k', '1M', '2M', '5M'];

        if (!validQualities.includes(quality) || !validFps.includes(fps) || !validBitrates.includes(bitrate)) {
            logger('Invalid parameters provided', { quality, fps, bitrate });
            return res.status(400).json({ error: 'Invalid video processing parameters' });
        }

        // Set video size based on quality
        let size;
        if (quality === '480') size = '854x480';
        else if (quality === '720') size = '1280x720';
        else if (quality === '1080') size = '1920x1080';

        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .size(size)
                .fps(parseInt(fps))
                .videoBitrate(bitrate)
                .videoCodec('libx264')
                .audioBitrate('128k')
                .audioChannels(2)
                .audioFrequency(44100)
                .audioCodec('aac')
                .format('mp4')
                .outputOptions([
                    '-preset medium',
                    '-movflags +faststart'
                ])
                .on('start', (commandLine) => {
                    logger('FFmpeg process started:', commandLine);
                })
                .on('progress', (progress) => {
                    logger('Processing:', progress);
                })
                .on('error', (err) => {
                    logger('FFmpeg error occurred', err);
                    reject(err);
                })
                .on('end', () => {
                    logger('FFmpeg process completed');
                    resolve();
                })
                .save(outputPath);
        });

        if (!fs.existsSync(outputPath)) {
            throw new Error('Output file was not created');
        }

        const fileStats = fs.statSync(outputPath);
        logger('Output file stats:', {
            size: fileStats.size,
            path: outputPath
        });

        if (fileStats.size === 0) {
            throw new Error('Output file is empty');
        }

        res.download(outputPath, 'processed-video.mp4', (err) => {
            if (err) {
                logger('Download error', err);
            } else {
                logger('File downloaded successfully');
            }
            safeCleanup(inputPath);
            safeCleanup(outputPath);
        });

    } catch (error) {
        logger('Error in video processing', error);
        safeCleanup(inputPath);
        safeCleanup(outputPath);
        res.status(500).json({ 
            error: 'Error processing video. Please try again.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
