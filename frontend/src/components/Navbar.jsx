import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginLogout = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  return (
    <div className="navbar flex items-center justify-between py-2 px-4 md:pr-7 gap-3">
      <div className="flex-1 flex items-center border border-gray-300 rounded-lg px-2 text-gray-700">
        <FiSearch size={24} className="text-[#9CA3AF] shrink-0 cursor-pointer" />
        <input
          type="text"
          placeholder="Search..."
          className="p-2 focus:outline-none w-full"
        />
      </div>
      <div className="shrink-0">
        {!isLoggedIn ? (
          <button
            className="px-4 py-1 bg-blue-500 text-md text-white rounded-md hover:bg-blue-600 transition"
            onClick={handleLoginLogout}
          >
            Login
          </button>
        ) : (
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden flex items-center justify-center cursor-pointer">
            <Popover className="relative">
              <PopoverButton className="flex text-[#3B40E8] items-center justify-center text-3xl md:text-4xl">
                <FaUserCircle />
              </PopoverButton>
              <PopoverPanel
                anchor="bottom"
                className="flex flex-col bg-[#D1D1D1] opacity-70 mt-2 items-start rounded-md shadow-md"
              >
                <div className="flex flex-col space-y-1 p-1 md:p-2 text-sm md:text-base">
                  <Link
                    to="/profile"
                    className="hover:bg-[#B6B6B6] px-2 md:px-3 py-1 rounded-md transition-colors"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/"
                    className="hover:bg-[#B6B6B6] px-2 md:px-3 py-1 rounded-md transition-colors"
                  >
                    Logout
                  </Link>
                </div>
              </PopoverPanel>
            </Popover>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
