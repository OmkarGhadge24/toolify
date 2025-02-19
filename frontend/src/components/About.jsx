import React from 'react';

const About = () => {
  return (
    <div className="p-4">
      <h1 className="text-xl md:text-2xl font-bold mb-4">About Toolify</h1>
      <p className="text-md md:text-lg mb-4">
        Welcome to <strong>Toolify</strong>, your go-to platform for a variety of essential tools designed 
        to simplify digital tasks. From file conversion to media editing, we provide instant, hassle-free solutions—all in one place.
      </p>

      <h2 className="text-lg md:text-xl font-semibold mb-3">Available Tools</h2>

      <p className="text-md md:text-lg">
        📌 <strong>Background Remover:</strong> Instantly remove backgrounds from any image with AI-powered precision.<br />
        📌 <strong>File Converter:</strong> Convert files between different formats, including images, documents, and media.<br />
        📌 <strong>Text Extractor:</strong> Extract text from images and scanned documents using OCR technology.<br />
        📌 <strong>Video to Audio:</strong> Convert video files into audio formats quickly and easily.<br />
        📌 <strong>Video Editor:</strong> Edit videos, adjust quality, FPS, and make enhancements effortlessly.<br />
        📌 <strong>PDF Editor:</strong> Edit, merge, split, and manage PDF files without any hassle.
      </p>

      <p className="text-md md:text-lg mt-6">
        Toolify is designed for speed, ease of use, and efficiency. Just select a tool, upload your file, and get results in seconds. 
        No installations, no delays—just instant solutions. Try it now!
      </p>
    </div>
  );
};

export default About;
