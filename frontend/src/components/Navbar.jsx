import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const handleLoginLogout = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  return (
    <div className="navbar">
      {/* Desktop Navbar */}
      <div className="hidden md:flex md:gap-4 items-center justify-between min-w-7xl mx-auto">
        <div className="flex-1 flex items-center border border-gray-300 rounded-lg px-2 text-gray-700">
          <FiSearch size={24} className="text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search..."
            className="p-2 focus:outline-none"
          />
        </div>
        <div className="flex gap-4">
          {!isLoggedIn ? (
            <>
              <button
                className="px-4 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                onClick={handleLoginLogout}
              >
                Login
              </button>
              <button className="px-4 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                Signup
              </button>
            </>
          ) : (
            <>
              <button
                className="px-4 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                onClick={handleLoginLogout}
              >
                Logout
              </button>
              <button className="px-4 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600">
                Profile
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Navbar */}
      <div className="flex flex-col md:hidden gap-4">
        <div className="flex-1 flex items-center border border-gray-300 rounded-lg px-2 text-gray-700">
          <FiSearch size={24} className="text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search..."
            className="p-2 focus:outline-none"
          />
        </div>
        <div className="flex justify-around">
          {!isLoggedIn ? (
            <>
              <button
                className="px-4 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                onClick={handleLoginLogout}
              >
                Login
              </button>
              <button className="px-4 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                Signup
              </button>
            </>
          ) : (
            <>
              <button
                className="px-4 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                onClick={handleLoginLogout}
              >
                Logout
              </button>
              <button className="px-4 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600">
                Profile
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
