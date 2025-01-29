const path = require('path');
const { promises: fs } = require('fs');
const {
  convertPdfToImage,
  convertImageToPdf,
  convertImageFormat,
  convertDocument,
  isImageFormat,
  getExtensionForFormat
} = require('../utils/converter');

const getOutputPath = (originalname, toFormat) => {
  const extension = getExtensionForFormat(toFormat);
  const filename = path.parse(originalname).name;
  const newFilename = `${filename}${extension}`;
  return path.join(__dirname, '../uploads', newFilename);
};

exports.convertFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { fromFormat, toFormat } = req.body;
    if (!fromFormat || !toFormat) {
      return res.status(400).json({ error: 'Missing conversion formats' });
    }

    console.log('Starting conversion:', { fromFormat, toFormat, file: req.file.originalname });

    const inputPath = req.file.path;
    const outputPath = getOutputPath(req.file.originalname, toFormat);

    let resultPath;

    // Handle image-specific conversions
    if (isImageFormat(fromFormat) && isImageFormat(toFormat)) {
      resultPath = await convertImageFormat(inputPath, outputPath, toFormat);
    }
    // Handle image to PDF conversion
    else if (isImageFormat(fromFormat) && toFormat === 'PDF') {
      resultPath = await convertImageToPdf(inputPath, outputPath);
    }
    // Handle PDF to image conversion
    else if (fromFormat === 'PDF' && isImageFormat(toFormat)) {
      resultPath = await convertPdfToImage(inputPath, outputPath, toFormat);
    }
    // Handle all other document conversions using LibreOffice
    else {
      resultPath = await convertDocument(inputPath, outputPath, toFormat);
    }

    console.log('Conversion completed:', { resultPath });

    // Send the converted file
    res.download(resultPath, path.basename(resultPath), async (err) => {
      // Clean up files after sending
      try {
        await fs.unlink(inputPath);
        await fs.unlink(resultPath);
      } catch (cleanupErr) {
        console.error('Error cleaning up files:', cleanupErr);
      }
    });
  } catch (error) {
    console.error('Conversion error:', error);
    
    // Clean up input file if it exists
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupErr) {
        console.error('Error cleaning up input file:', cleanupErr);
      }
    }
    
    res.status(500).json({ error: error.message });
  }
};
