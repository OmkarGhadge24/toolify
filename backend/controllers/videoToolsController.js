const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

// Set FFmpeg path for Windows
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

// Verify FFmpeg installation silently
try {
    ffmpeg.getAvailableFormats(function(err) {
        if (err) {
            throw new Error('FFmpeg is not properly configured');
        }
    });
} catch (error) {
    if (process.env.NODE_ENV !== 'production') {
        console.error('Error initializing FFmpeg:', error.message);
    }
}

// Ensure required directories exist
const ensureDirectories = () => {
    const dirs = ['uploads/videos', 'uploads/audio', 'uploads/processed'];
    dirs.forEach(dir => {
        const fullPath = path.resolve(dir);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }
    });
};

ensureDirectories();

// Validate video file
const validateVideoFile = (file) => {
    const validFormats = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-matroska', 'video/webm'];
    
    if (!file) {
        throw new Error('No file uploaded');
    }
    
    if (!validFormats.includes(file.mimetype)) {
        throw new Error('Invalid file format. Please upload a valid video file.');
    }
    
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
        throw new Error('File size exceeds 500MB limit');
    }
};

// Safe file cleanup
const safeCleanup = (filePath) => {
    try {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        // Ignore cleanup errors
    }
};

// Get video information
const getVideoInfo = (inputPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(inputPath, (err, metadata) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(metadata);
        });
    });
};

// Process video with multiple fallback options
const processVideoWithFallback = async (inputPath, outputPath, options) => {
    const { finalWidth, finalHeight, fps, bitrate, targetBitrate } = options;
    
    const attempts = [
        // Attempt 1: High quality with specified settings
        {
            size: `${finalWidth}x${finalHeight}`,
            videoBitrate: bitrate,
            videoCodec: 'libx264',
            options: [
                '-preset medium',
                '-movflags +faststart',
                '-pix_fmt yuv420p'
            ]
        },
        // Attempt 2: More compatible settings
        {
            size: `${finalWidth}x${finalHeight}`,
            videoBitrate: targetBitrate,
            videoCodec: 'libx264',
            options: [
                '-preset medium',
                '-movflags +faststart',
                '-pix_fmt yuv420p',
                '-strict experimental'
            ]
        },
        // Attempt 3: Most compatible settings
        {
            size: `${finalWidth}x${finalHeight}`,
            videoBitrate: '1M',
            videoCodec: 'libx264',
            options: [
                '-preset ultrafast',
                '-movflags +faststart',
                '-pix_fmt yuv420p',
                '-strict experimental',
                '-vf format=yuv420p'
            ]
        },
        // Attempt 4: Fallback to lower resolution
        {
            size: '640x360',
            videoBitrate: '800k',
            videoCodec: 'libx264',
            options: [
                '-preset ultrafast',
                '-movflags +faststart',
                '-pix_fmt yuv420p',
                '-strict experimental',
                '-vf format=yuv420p'
            ]
        }
    ];

    let lastError = null;

    for (const attempt of attempts) {
        try {
            await new Promise((resolve, reject) => {
                ffmpeg(inputPath)
                    .size(attempt.size)
                    .fps(parseInt(fps))
                    .videoBitrate(attempt.videoBitrate)
                    .videoCodec(attempt.videoCodec)
                    .outputOptions(attempt.options)
                    .format('mp4')
                    .on('end', resolve)
                    .on('error', reject)
                    .save(outputPath);
            });
            return; // Success
        } catch (error) {
            lastError = error;
            // Continue to next attempt
        }
    }

    // If all attempts failed
    throw new Error(lastError?.message || 'Failed to process video after multiple attempts');
};

// Extract audio from video
const extractAudio = async (req, res) => {
    let inputPath = null;
    let outputPath = null;

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        validateVideoFile(req.file);
        
        inputPath = req.file.path;
        const outputFileName = `audio_${Date.now()}.mp3`;
        outputPath = path.join(__dirname, '..', 'uploads', 'audio', outputFileName);

        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .toFormat('mp3')
                .audioCodec('libmp3lame')
                .audioBitrate('192k')
                .outputOptions(['-q:a 0', '-map a'])
                .on('end', resolve)
                .on('error', reject)
                .save(outputPath);
        });

        res.download(outputPath, outputFileName, (err) => {
            if (err) {
                res.status(500).json({ error: 'Error downloading file' });
            }
            safeCleanup(inputPath);
            safeCleanup(outputPath);
        });

    } catch (error) {
        safeCleanup(inputPath);
        safeCleanup(outputPath);
        res.status(500).json({ error: error.message || 'Error processing video' });
    }
};

// Process video with improved error handling and adaptive quality
const processVideo = async (req, res) => {
    let inputPath = null;
    let outputPath = null;

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        validateVideoFile(req.file);
        
        const { quality = '720', fps = '30', bitrate = '1M' } = req.body;
        
        inputPath = req.file.path;
        const outputFileName = `processed_${Date.now()}.mp4`;
        outputPath = path.join(__dirname, '..', 'uploads', 'processed', outputFileName);

        // Get video information
        const videoInfo = await getVideoInfo(inputPath);
        const videoStream = videoInfo.streams.find(s => s.codec_type === 'video');
        
        if (!videoStream) {
            throw new Error('No video stream found in the file');
        }

        // Calculate optimal video settings
        const targetHeight = parseInt(quality);
        const originalHeight = videoStream.height || 720;
        const originalWidth = videoStream.width || 1280;
        const aspectRatio = originalWidth / originalHeight;
        const targetWidth = Math.round(targetHeight * aspectRatio);
        
        // Ensure even dimensions (required by some codecs)
        const finalWidth = targetWidth + (targetWidth % 2);
        const finalHeight = targetHeight + (targetHeight % 2);

        // Calculate optimal bitrate based on resolution
        const targetBitrate = quality === '1080' ? '4M' : 
                            quality === '720' ? '2M' : '1M';

        await processVideoWithFallback(inputPath, outputPath, {
            finalWidth,
            finalHeight,
            fps,
            bitrate,
            targetBitrate
        });

        res.download(outputPath, outputFileName, (err) => {
            if (err) {
                res.status(500).json({ error: 'Error downloading file' });
            }
            safeCleanup(inputPath);
            safeCleanup(outputPath);
        });

    } catch (error) {
        safeCleanup(inputPath);
        safeCleanup(outputPath);
        res.status(500).json({ 
            error: error.message || 'Error processing video. Please try a different quality setting or video format.' 
        });
    }
};

module.exports = {
    extractAudio,
    processVideo
};
