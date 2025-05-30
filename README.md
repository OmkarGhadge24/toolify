# Toolify – Advanced Utility Tools Platform

**Toolify** is a comprehensive web-based platform built with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js) that provides a suite of essential file-processing tools. With its clean and responsive UI, real-time performance, and powerful backend, Toolify helps users simplify and streamline their everyday digital tasks.

It combines **six major utilities** into one platform:

- 🖼️ Background Remover  
- 📤 File Converter  
- 📄 Text Extractor  
- 🎞️ Video Editor  
- 🎧 Video to Audio Converter  
- 📚 PDF Editor  

Whether you're a student, content creator, developer, or business professional, Toolify offers a seamless, intuitive experience for fast and efficient file handling.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup and Installation](#setup-and-installation)
- [Folder Structure](#folder-structure)
- [Tool Descriptions](#tool-descriptions)

## Overview

**Toolify** is a modern web application built using the MERN stack (MongoDB, Express.js, React, Node.js). It brings together multiple file-processing tools into a single, easy-to-use platform. The app is designed for speed, simplicity, and accessibility, with a clean user interface built using Tailwind CSS.

All processing happens securely on the backend, using advanced libraries like FFmpeg and external APIs. Users can perform tasks directly from their browser—no software installation or login required for core tools. It's perfect for students, creators, professionals, and anyone who works with digital files regularly.

Toolify helps save time and effort by offering everything in one place.


## Features

- 🖼️ **Background Remover** – Instantly remove image backgrounds using AI.
- 📤 **File Converter** – Convert files between formats like PDF, Excel, JPG, PNG, and more.
- 📄 **Text Extractor** – Extract text from images using OCR technology.
- 🎞️ **Video Editor** – Edit video resolution and frame rate easily.
- 🎧 **Video to Audio** – Convert videos to audio files (like MP3).
- 📚 **PDF Editor** – Merge or split PDF files.

## Technologies Used

### 🧠 Frontend
- **React.js** – For building the interactive user interface
- **Tailwind CSS** – For fast and responsive styling
- **React Router** – For navigating between tools

### 🛠 Backend
- **Node.js & Express.js** – For building REST APIs and processing logic
- **MongoDB** – For storing user data and file history
- **Mongoose** – For database modeling and queries

### ⚙️ External APIs & Libraries
- **FFmpeg** – For video editing and converting video to audio
- **Remove.bg API** – For AI-powered background removal
- **Ninja OCR API** – For extracting text from images using OCR
- **ConvertAPI** – For file format conversions and PDF editing

## Setup and Installation

### Prerequisites

- Node.js (Latest LTS version)
- MongoDB

### Installation Steps

1. **Clone the project**

  ```bash
    git clone https://github.com/OmkarGhadge24/toolify.git
  ```

2. **Navigate to the project directory**

  ```bash
    cd toolify
  ```

3. **Install server dependencies**

  ```bash
    cd backend
    npm install
  ```

4. **Install client dependencies**

  ```bash
    cd frontend
    npm install
  ```

5. **Environment Variables**
  Create a .env file in the backend directory and configure the following:
  
  ```bash
    MONGODB_URI=mongodb://localhost:27017/toolify
    PORT=5000
    JWT_SECRET=your_jwt_secret
    REMOVE_BG_API_KEY=remove_bg_api_key
    NINJA_API_KEY=ninja_ocr_api_key
    CONVERT_API_SECRET=convertapi_key
  ```

6. **Run the app**

- Start the backend:
  ```bash
    cd backend
    npm start
  ```

- Start the frontend:
  ```bash
    cd frontend
    npm start
  ```
  Access the app at http://localhost:3000.

## Folder Structure

  ```plaintext
    toolify
    │── backend
    │   │── controllers
    │   │   ├── authController.js
    │   │   ├── fileConverterController.js
    │   │   ├── textExtractorController.js
    │   │   ├── videoToolsController.js
    │   │
    │   │── middleware
    │   │   ├── auth.js
    │   │
    │   │── models
    │   │   ├── Contact.js
    │   │   ├── User.js
    │   │
    │   │── routes
    │   │   ├── authRoutes.js
    │   │   ├── backgroundRemover.js
    │   │   ├── contactRoutes.js
    │   │   ├── fileConverterRoutes.js
    │   │   ├── pdfRoutes.js
    │   │   ├── textExtractorRoutes.js
    │   │   ├── videoToolsRoutes.js
    │   │
    │   │── utils
    │   │   ├── converter.js
    │   │
    │   │── temp
    │   │   ├── .gitkeep
    │   │
    │   │── uploads
    │   │   │── audio
    │   │   │   ├── .gitkeep
    │   │   │── processed
    │   │   │   ├── .gitkeep
    │   │   │── videos
    │   │   │   ├── .gitkeep
    │   │
    │   │── .env
    │   │── .gitignore
    │   │── package-lock.json
    │   │── package.json
    │   │── server.js
    │
    │── frontend
    │   │── public
    │   │   │── fonts
    │   │   │   ├── Poppins-Regular.ttf
    │   │   │
    │   │   │── images
    │   │   │   ├── female.png
    │   │   │   ├── male.png
    │   │   │   ├── other.png
    │   │   │   ├── save.png
    │   │   │
    │   │   │── favicon.ico
    │   │   │── index.html
    │   │   │── manifest.json
    │   │   │── robots.txt
    │   │
    │   │── src
    │   │   │── components
    │   │   │   │── converters
    │   │   │   │   ├── ConversionArea.jsx
    │   │   │   │   ├── ConverterCard.jsx
    │   │   │   │
    │   │   │   │── About.jsx
    │   │   │   │── ContactUs.jsx
    │   │   │   │── Login.jsx
    │   │   │   │── Main.jsx
    │   │   │   │── Menu.jsx
    │   │   │   │── Navbar.jsx
    │   │   │   │── Others.jsx
    │   │   │   │── Profile.jsx
    │   │   │   │── Signup.jsx
    │   │
    │   │   │── context
    │   │   │   ├── ThemeContext.js
    │   │
    │   │   │── pages
    │   │   │   ├── BackgroundRemover.jsx
    │   │   │   ├── FileConverter.jsx
    │   │   │   ├── Home.jsx
    │   │   │   ├── PdfEditor.jsx
    │   │   │   ├── TextExtractor.jsx
    │   │   │   ├── VideoEditor.jsx
    │   │   │   ├── VideoToAudio.jsx
    │   │
    │   │   │── App.js
    │   │   │── index.css
    │   │   │── index.js
    │   │   │── reportWebVitals.js
    │   │
    │   │── .gitignore
    │   │── package-lock.json
    │   │── package.json
    │   │── tailwind.config.js
  ```

## Tool Descriptions

Each tool in Toolify is designed for a specific file-processing task:

- **Background Remover**: Upload an image and remove its background using AI (Remove.bg API).

- **File Converter**: Convert documents and images between formats (e.g., PDF ⇄ Excel, JPG ⇄ PNG) using ConvertAPI.

- **Text Extractor**: Extract text from images using OCR via Ninja OCR API.

- **Video Editor**: Modify video resolution and frame rate using FFmpeg.

- **Video to Audio**: Convert video files to audio formats like MP3 using FFmpeg.

- **PDF Editor**: Merge or split PDF files using ConvertAPI.
