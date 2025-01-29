const { createWorker } = require('tesseract.js');
const fs = require('fs').promises;

exports.extractText = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const worker = await createWorker();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');

        const { data: { text } } = await worker.recognize(req.file.path);
        await worker.terminate();

        // Clean up the uploaded file
        await fs.unlink(req.file.path);

        res.json({ text });
    } catch (error) {
        console.error('Text extraction error:', error);
        
        // Clean up input file if it exists
        if (req.file && req.file.path) {
            try {
                await fs.unlink(req.file.path);
            } catch (cleanupErr) {
                console.error('Error cleaning up input file:', cleanupErr);
            }
        }
        
        res.status(500).json({ 
            error: 'Text extraction failed',
            details: error.message 
        });
    }
};
