import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaClipboard } from 'react-icons/fa';

const TextExtractor = () => {
    const [file, setFile] = useState(null);
    const [extractedText, setExtractedText] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && (selectedFile.type === 'image/jpeg' || selectedFile.type === 'image/png')) {
            if (selectedFile.size <= 500 * 1024) {
                setFile(selectedFile);
            } else {
                toast.error('File size must be less than 500KB');
            }
        } else {
            toast.error('Please select a valid JPEG or PNG image');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error('Please select an image file');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:5000/api/text-extractor/extract-text', formData);
            setExtractedText(response.data.text);
        } catch (error) {
            const errorMessage = error.response?.data?.details || error.response?.data?.error || 'Error processing image';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(extractedText)
      .then(() => {
        const originalText = document.getElementById('copyButton').innerText;
        document.getElementById('copyButton').innerText = 'Copied!';
        setTimeout(() => {
          document.getElementById('copyButton').innerText = originalText;
        }, 2000);
      })
      .catch(err => {
        toast.error('Failed to copy text:', err);
        toast.error('Failed to copy text to clipboard');
      });
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Text Extractor</h1>
            
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Upload Image (JPEG/PNG, max 500KB)
                        </label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept="image/jpeg,image/png"
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={!file || loading}
                        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                            !file || loading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {loading ? 'Processing...' : 'Extract Text'}
                    </button>
                </form>

                {extractedText && (
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-lg font-semibold">Extracted Text:</h2>
                            <button
                                onClick={copyToClipboard}
                                className="p-2 text-blue-600 hover:text-blue-800"
                                title="Copy to clipboard"
                            >
                                <FaClipboard />
                            </button>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-md">
                            <p className="whitespace-pre-wrap">{extractedText}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TextExtractor;
