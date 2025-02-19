import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiSearch } from "react-icons/fi";
import { FaUserCircle } from 'react-icons/fa';
import { Popover } from "@headlessui/react";
import { useTheme } from "../context/ThemeContext";

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const { theme } = useTheme();

    // List of available tools only
    const tools = [
        { 
            name: "Background Remover", 
            route: "/background-remover", 
            keywords: ["background", "remove", "image", "photo", "picture", "bg"],
            description: "Remove background from images"
        },
        { 
            name: "Text Extractor", 
            route: "/text-extractor", 
            keywords: ["text", "extract", "ocr", "scan", "read", "document"],
            description: "Extract text from images and documents"
        },
        { 
            name: "File Converter", 
            route: "/file-converter", 
            keywords: ["convert", "file", "format", "change", "transform", "type"],
            description: "Convert files between different formats"
        },
        {
            name: "Video To Audio",
            route: "/video-to-audio",
            keywords: ["convert", "video", "audio", "format", "change", "transform", "type"],
            description: "Convert videos to audio"
        },
        {
            name: "Video Editor",
            route: "/video-editor",
            keywords: ["edit", "video", "quality", "fps", "change", "transform", "type"],
            description: "Edit video quality, FPS, and more"
        },
        {
            name: "Pdf Editor",
            route: "/pdf-editor",
            keywords: ["edit", "pdf", "merge", "split", "change", "transform"],
            description: "Edit pdf files, merge and split"
        }
    ];

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        if (query.trim() === '') {
            setShowResults(false);
            return;
        }

        // Search through tools
        const results = tools.filter(tool => {
            return (
                tool.name.toLowerCase().includes(query) ||
                tool.keywords.some(keyword => keyword.includes(query))
            );
        });

        setSearchResults(results);
        setShowResults(true);
    };

    const handleResultClick = (route) => {
        setSearchQuery('');
        setShowResults(false);
        navigate(route);
    };

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:5000/api/auth/logout', {}, {
                withCredentials: true
            });
            setIsAuthenticated(false);
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <nav className={`${theme === "light" ? "bg-white" : "bg-[#1a1b2e]"}`}>
            <div className="mx-auto px-2 md:px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Search Bar */}
                    <div className="flex-1 mx-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiSearch className={`h-5 w-5 ${theme === "light" ? "text-gray-400" : "text-gray-500"}`} />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearch}
                                placeholder="Search tools..."
                                className={`block w-full pl-10 pr-3 py-2 border rounded-md leading-5 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 sm:text-sm ${
                                    theme === "light"
                                        ? "bg-white border-gray-300 text-black"
                                        : "bg-[#252942] border-gray-600 text-white"
                                }`}
                            />
                            
                            {/* Search Results Dropdown */}
                            {showResults && searchResults.length > 0 && (
                                <div className={`absolute mt-1 w-full rounded-md shadow-lg max-h-60 overflow-auto z-50 ${
                                    theme === "light" ? "bg-white" : "bg-[#1a1b2e]"
                                }`}>
                                    {searchResults.map((result, index) => (
                                        <div
                                            key={index}
                                            onClick={() => handleResultClick(result.route)}
                                            className={`px-4 py-2 cursor-pointer ${
                                                theme === "light"
                                                    ? "hover:bg-gray-100"
                                                    : "hover:bg-[#252942]"
                                            }`}
                                        >
                                            <div className={`text-sm font-medium ${
                                                theme === "light" ? "text-gray-900" : "text-white"
                                            }`}>
                                                {result.name}
                                            </div>
                                            <div className={`text-xs ${
                                                theme === "light" ? "text-gray-500" : "text-gray-400"
                                            }`}>
                                                {result.description}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Auth Button */}
                    <div className="flex items-center">
                        {isAuthenticated ? (
                            <Popover className="relative">
                                <Popover.Button className={`flex ${
                                    theme === "light" 
                                        ? "text-gray-600 hover:text-gray-900" 
                                        : "text-gray-400 hover:text-white"
                                }`}>
                                    <FaUserCircle className="h-8 w-8" />
                                </Popover.Button>
                                <Popover.Panel className={`absolute right-0 z-10 mt-2 w-48 rounded-md py-1 shadow-lg ring-1 ring-black ring-opacity-5 ${
                                    theme === "light" ? "bg-white" : "bg-[#1a1b2e]"
                                }`}>
                                    <Link
                                        to="/profile"
                                        className={`block px-4 py-2 text-sm ${
                                            theme === "light"
                                                ? "text-gray-700 hover:bg-gray-100"
                                                : "text-gray-300 hover:bg-[#252942]"
                                        }`}
                                    >
                                        Profile
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className={`block w-full text-left px-4 py-2 text-sm ${
                                            theme === "light"
                                                ? "text-gray-700 hover:bg-gray-100"
                                                : "text-gray-300 hover:bg-[#252942]"
                                        }`}
                                    >
                                        Logout
                                    </button>
                                </Popover.Panel>
                            </Popover>
                        ) : (
                            <Link
                                to="/login"
                                className={`ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
                                    theme === "light"
                                        ? "text-white bg-indigo-600 hover:bg-indigo-700"
                                        : "text-white bg-[#252942] hover:bg-[#151623]"
                                }`}
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
