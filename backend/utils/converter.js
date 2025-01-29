const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');
const { promises: fs } = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');
const mammoth = require('mammoth');
const docx = require('docx');
const ExcelJS = require('exceljs');
const htmlPdf = require('html-pdf-node');
const PDFKit = require('pdfkit');

// Format extensions mapping
const FORMAT_EXTENSIONS = {
  PDF: '.pdf',
  WORD: '.docx',
  DOC: '.doc',
  TXT: '.txt',
  XLS: '.xlsx',
  XLSX: '.xlsx',
  HTML: '.html'
};

// Image format extensions
const IMAGE_FORMATS = ['JPG', 'JPEG', 'PNG', 'WEBP', 'TIFF', 'GIF'];

// PDF to Word conversion using pdf2json and docx
exports.convertPdfToWord = async (inputPath, outputPath) => {
  try {
    const pdfParser = new PDFParser();
    
    const pdfData = await new Promise((resolve, reject) => {
      pdfParser.loadPDF(inputPath);
      pdfParser.on('pdfParser_dataReady', (data) => resolve(data));
      pdfParser.on('pdfParser_dataError', (err) => reject(err));
    });

    const doc = new docx.Document({
      sections: [{
        properties: {},
        children: pdfData.Pages.flatMap(page => 
          page.Texts.map(text => 
            new docx.Paragraph({
              children: [new docx.TextRun(decodeURIComponent(text.R[0].T))]
            })
          )
        )
      }]
    });

    const buffer = await docx.Packer.toBuffer(doc);
    await fs.writeFile(outputPath, buffer);
    return outputPath;
  } catch (err) {
    console.error('PDF to Word conversion error:', err);
    throw new Error('PDF to Word conversion failed: ' + err.message);
  }
};

// Word to PDF conversion using mammoth and pdf-lib
exports.convertWordToPdf = async (inputPath, outputPath) => {
  try {
    const buffer = await fs.readFile(inputPath);
    const result = await mammoth.convertToHtml({ buffer });
    
    const options = { format: 'A4' };
    const file = { content: result.value };
    
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    await fs.writeFile(outputPath, pdfBuffer);
    return outputPath;
  } catch (err) {
    console.error('Word to PDF conversion error:', err);
    throw new Error('Word to PDF conversion failed: ' + err.message);
  }
};

// PDF to Text conversion using pdf2json
exports.convertPdfToText = async (inputPath, outputPath) => {
  try {
    const pdfParser = new PDFParser();
    
    const pdfData = await new Promise((resolve, reject) => {
      pdfParser.loadPDF(inputPath);
      pdfParser.on('pdfParser_dataReady', (data) => resolve(data));
      pdfParser.on('pdfParser_dataError', (err) => reject(err));
    });

    const text = pdfData.Pages
      .flatMap(page => page.Texts.map(text => decodeURIComponent(text.R[0].T)))
      .join('\n');

    await fs.writeFile(outputPath, text);
    return outputPath;
  } catch (err) {
    console.error('PDF to Text conversion error:', err);
    throw new Error('PDF to Text conversion failed: ' + err.message);
  }
};

// Excel to PDF conversion using ExcelJS and PDFKit
exports.convertExcelToPdf = async (inputPath, outputPath) => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(inputPath);
    
    const doc = new PDFKit();
    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);
    
    for (const worksheet of workbook.worksheets) {
      doc.fontSize(14).text(worksheet.name, { underline: true });
      doc.moveDown();
      
      worksheet.eachRow((row, rowNumber) => {
        const rowData = row.values.slice(1).join(' | ');
        doc.fontSize(10).text(rowData);
      });
      
      doc.addPage();
    }
    
    doc.end();
    
    return new Promise((resolve, reject) => {
      writeStream.on('finish', () => resolve(outputPath));
      writeStream.on('error', reject);
    });
  } catch (err) {
    console.error('Excel to PDF conversion error:', err);
    throw new Error('Excel to PDF conversion failed: ' + err.message);
  }
};

// PDF to Image conversion
exports.convertPdfToImage = async (inputPath, outputPath, format = 'png') => {
  try {
    await sharp(inputPath, { page: 0 })
      .toFormat(format.toLowerCase())
      .toFile(outputPath);
    return outputPath;
  } catch (err) {
    console.error('PDF to Image conversion error:', err);
    throw new Error('PDF to Image conversion failed: ' + err.message);
  }
};

// Image to PDF conversion
exports.convertImageToPdf = async (inputPath, outputPath) => {
  try {
    const pdfDoc = await PDFDocument.create();
    const imageBuffer = await fs.readFile(inputPath);
    
    // Convert image to PNG if it's not already
    const pngBuffer = await sharp(imageBuffer)
      .png()
      .toBuffer();
    
    const image = await pdfDoc.embedPng(pngBuffer);
    const page = pdfDoc.addPage();
    
    // Calculate dimensions to fit image properly
    const { width, height } = image.size();
    const aspectRatio = width / height;
    const pageWidth = page.getSize().width;
    const pageHeight = pageWidth / aspectRatio;
    
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
    });
    
    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, pdfBytes);
    return outputPath;
  } catch (err) {
    console.error('Image to PDF conversion error:', err);
    throw new Error('Image to PDF conversion failed: ' + err.message);
  }
};

// Image format conversion
exports.convertImageFormat = async (inputPath, outputPath, format) => {
  try {
    const image = sharp(await fs.readFile(inputPath));
    await image.toFormat(format.toLowerCase()).toFile(outputPath);
    return outputPath;
  } catch (err) {
    console.error('Image format conversion error:', err);
    throw new Error(`Image conversion to ${format} failed: ` + err.message);
  }
};

// HTML to PDF conversion
exports.convertHtmlToPdf = async (inputPath, outputPath) => {
  try {
    const html = await fs.readFile(inputPath, 'utf8');
    const options = { format: 'A4' };
    const file = { content: html };
    
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    await fs.writeFile(outputPath, pdfBuffer);
    return outputPath;
  } catch (err) {
    console.error('HTML to PDF conversion error:', err);
    throw new Error('HTML to PDF conversion failed: ' + err.message);
  }
};

// Helper function to check if format is an image format
exports.isImageFormat = (format) => IMAGE_FORMATS.includes(format.toUpperCase());

// Helper function to get file extension for a format
exports.getExtensionForFormat = (format) => FORMAT_EXTENSIONS[format] || `.${format.toLowerCase()}`;