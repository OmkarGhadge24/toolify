import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Home from "./pages/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import BackgroundRemover from "./pages/BackgroundRemover";
import TextExtractor from "./pages/TextExtractor";
import FileConverter from "./pages/FileConverter";
import VideoToAudio from "./pages/VideoToAudio";
import VideoEditor from "./pages/VideoEditor";
import PdfEditor from "./pages/PdfEditor";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <ThemeProvider>
      <div className="App w-full h-screen font-['poppins']">
        <Routes>
          <Route path="/*" element={<Home isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/background-remover" element={<BackgroundRemover />} />
          <Route path="/text-extractor" element={<TextExtractor />} />
          <Route path="/file-converter" element={<FileConverter />} />
          <Route path="/video-to-audio" element={<VideoToAudio />} />
          <Route path="/video-editor" element={<VideoEditor />} />
          <Route path="/pdf-editor" element={<PdfEditor />} />
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
