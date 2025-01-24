import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
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

  // Redirect to login if not authenticated
  if (!isAuthenticated && location.pathname !== '/login' && location.pathname !== '/signup') {
    return <Navigate to="/login" />;
  }

  return (
    <div className="w-full flex-1 transition-all duration-300 bg-[#dadada] h-full overflow-hidden">
      <div className="bg-white w-full border-2 rounded-md border-[rgba(0,0,0,0.08)] h-full shadow-sm flex">
        <Menu isOpen={isOpen} setIsOpen={setIsOpen} />
        
        <div className="w-full flex flex-col gap-4 bg-white border-2 rounded-md border-[rgba(0,0,0,0.08)] p-2">
          <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
          
          <div className="w-full flex-grow rounded-md p-4 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Main />} />
              <Route path="/profile" element={<Profile isAuthenticated={isAuthenticated} />} />
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
