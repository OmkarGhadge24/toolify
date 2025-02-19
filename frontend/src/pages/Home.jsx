import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Menu from "../components/Menu";
import Navbar from "../components/Navbar";
import Profile from "../components/Profile";
import About from "../components/About";
import ContactUs from "../components/ContactUs";
import Others from "../components/Others";
import Main from "../components/Main";

const Home = ({ isAuthenticated, setIsAuthenticated }) => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const { theme } = useTheme();

  return (
    <div className={`w-full flex-1 transition-all duration-300 h-full overflow-hidden ${
      theme === "light" ? "bg-[#dadada]" : "bg-[#151623]"
    }`}>
      <div className={`w-full border-2 rounded-md h-full shadow-sm flex ${
        theme === "light" 
          ? "bg-white border-[rgba(0,0,0,0.08)]" 
          : "bg-[#1a1b2e] border-[rgba(255,255,255,0.08)]"
      }`}>
        {/* Fixed Sidebar */}
        <Menu isOpen={isOpen} setIsOpen={setIsOpen} />
        
        <div className={`w-full flex flex-col gap-2 border-2 rounded-md p-2 ${
          theme === "light" 
            ? "bg-white border-[rgba(0,0,0,0.08)]" 
            : "bg-[#1a1b2e] border-[rgba(255,255,255,0.08)]"
        }`}>
          {/* Fixed Navbar */}
          <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
          
          {/* Dynamic Content Area */}
          <div className={`w-full flex-grow rounded-md p-4 overflow-y-auto ${
            theme === "light" 
              ? "bg-white text-black" 
              : "bg-[#1a1b2e] text-white"
          }`}>
            <Routes>
              <Route path="/" element={<Main />} />
              <Route path="profile" element={<Profile isAuthenticated={isAuthenticated} />} />
              <Route path="contactus" element={<ContactUs />} />
              <Route path="about" element={<About />} />
              <Route path="others" element={<Others />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
