import React, { useState } from "react";
import { Link } from "react-router-dom";
import { TiThMenuOutline } from "react-icons/ti";
import { IoClose } from "react-icons/io5";
import { SlRocket, SlUser, SlPhone, SlInfo, SlPaperClip } from "react-icons/sl";

const Menu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <div className="relative bg-[#F4EFEB] h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <img
            src="/images/save.png"
            alt="Toolify"
            className="w-10 h-10 rounded-full object-cover object-center"
          />
          <h1 className="text-2xl font-['helvetica'] font-semibold">Toolify</h1>
        </div>
        {!isMenuOpen && (
          <button
            className="md:hidden text-2xl"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
          >
            <TiThMenuOutline />
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 h-full bg-[#F4EFEB] transition-transform duration-300 ease-in-out z-50 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden`}
      >
        <button
          className="absolute top-4 right-4 text-2xl"
          onClick={() => setIsMenuOpen(false)}
          aria-label="Close menu"
        >
          <IoClose />
        </button>
        <div className="flex flex-col items-center h-full mt-10 p-6 space-y-4">
          <Link
            to="/"
            className="flex items-center w-full gap-3 text-lg text-gray-700 p-3 rounded-lg transition-all duration-300 ease-in-out hover:bg-[#3D6984] hover:text-white text-center"
            onClick={() => setIsMenuOpen(false)}
          >
            <SlRocket />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/profile"
            className="flex items-center w-full gap-3 text-lg text-gray-700 p-3 rounded-lg transition-all duration-300 ease-in-out hover:bg-[#3D6984] hover:text-white text-center"
            onClick={() => setIsMenuOpen(false)}
          >
            <SlUser />
            <span>Profile</span>
          </Link>
          <Link
            to="/about"
            className="flex items-center w-full gap-3 text-lg text-gray-700 p-3 rounded-lg transition-all duration-300 ease-in-out hover:bg-[#3D6984] hover:text-white text-center"
            onClick={() => setIsMenuOpen(false)}
          >
            <SlInfo />
            <span>About</span>
          </Link>
          <Link
            to="/contact"
            className="flex items-center w-full gap-3 text-lg text-gray-700 p-3 rounded-lg transition-all duration-300 ease-in-out hover:bg-[#3D6984] hover:text-white text-center"
            onClick={() => setIsMenuOpen(false)}
          >
            <SlPhone />
            <span>Contact Us</span>
          </Link>
          <Link
            to="/others"
            className="flex items-center w-full gap-3 text-lg text-gray-700 p-3 rounded-lg transition-all duration-300 ease-in-out hover:bg-[#3D6984] hover:text-white text-center"
            onClick={() => setIsMenuOpen(false)}
          >
            <SlPaperClip />
            <span>Others</span>
          </Link>
        </div>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex flex-col h-full gap-4 mt-5">
        <Link
          to="/"
          className="flex items-center gap-3 text-lg ml-6 text-gray-700 p-3 border-r-2 border-transparent transition-all duration-300 ease-in-out hover:border-[#3D6984] text-center"
        >
          <SlRocket />
          <span>Dashboard</span>
        </Link>
        <Link
          to="/profile"
          className="flex items-center gap-3 text-lg ml-6 text-gray-700 p-3 border-r-2 border-transparent transition-all duration-300 ease-in-out hover:border-[#3D6984] text-center"
        >
          <SlUser />
          <span>Profile</span>
        </Link>
        <Link
          to="/about"
          className="flex items-center gap-3 text-lg ml-6 text-gray-700 p-3 border-r-2 border-transparent transition-all duration-300 ease-in-out hover:border-[#3D6984] text-center"
        >
          <SlInfo />
          <span>About</span>
        </Link>
        <Link
          to="/contact"
          className="flex items-center gap-3 text-lg ml-6 text-gray-700 p-3 border-r-2 border-transparent transition-all duration-300 ease-in-out hover:border-[#3D6984] text-center"
        >
          <SlPhone />
          <span>Contact Us</span>
        </Link>
        <Link
          to="/others"
          className="flex items-center gap-3 text-lg ml-6 text-gray-700 p-3 border-r-2 border-transparent transition-all duration-300 ease-in-out hover:border-[#3D6984] text-center"
        >
          <SlPaperClip />
          <span>Others</span>
        </Link>
      </div>
    </div>
  );
};

export default Menu;
