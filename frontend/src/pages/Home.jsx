import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Menu from "../components/Menu";
import Navbar from "./../components/Navbar";
import Main from "../components/Main";
import About from "../components/About";
import Profile from "../components/Profile";
import ContactUs from "../components/ContactUs";
import Others from "../components/Others";

const Home = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="w-full flex-1 transition-all duration-300 bg-[#dadada] h-full overflow-hidden">
      <div className="bg-white w-full border-2 rounded-md border-[rgba(0,0,0,0.08)] h-full shadow-sm flex">
        {/* Sidebar */}
        <Menu isOpen={isOpen} setIsOpen={setIsOpen} />
        
        {/* Main Content */}
        <div className="w-full flex flex-col gap-4 bg-white border-2 rounded-md border-[rgba(0,0,0,0.08)] p-2">
          {location.pathname === "/" && <Navbar />}
          
          <div className="w-full flex-grow bg-slate-200 rounded-md p-4">
            <Routes>
              <Route path="/" element={<Main />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/contactus" element={<ContactUs />} />
              <Route path="/about" element={<About />} />
              <Route path="/others" element={<Others />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
