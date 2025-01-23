import React, { useState } from "react";
import {
  FiChevronDown,
  FiMaximize2,
  FiX,
  FiHome,
  FiUser,
  FiMessageSquare,
  FiFeather,
  FiPaperclip,
} from "react-icons/fi";
import { Link } from "react-router-dom";

const Menu = ({ isOpen, setIsOpen }) => {
  const [activeDropdown, setActiveDropdown] = useState("");

  const navItems = [
    { title: "Home", icon: FiHome, hasDropdown: false, route: "/" },
    { title: "Profile", icon: FiUser, hasDropdown: false, route: "/profile" },
    {
      title: "Contact Us",
      icon: FiMessageSquare,
      hasDropdown: true,
      route: "/contactus",
      dropdownItems: ["Email", "LinkedIn", "GitHub"],
    },
    { title: "About Us", icon: FiFeather, hasDropdown: false, route: "/about" },
    { title: "Others", icon: FiPaperclip, hasDropdown: false, route: "/others" },
  ];

  return (
    <div
      className={`bg-white h-full text-black transition-all duration-300 ease-in-out text-sm border-2 rounded-md border-[rgba(0,0,0,0.08)] ${
        isOpen ? "w-48 md:w-64" : "w-16"
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-4 flex justify-between items-center">
        <h1
          className={`font-bold overflow-hidden transition-all duration-300 text-lg whitespace-nowrap text-[#3B40E8] ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        >
          Toolify
        </h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hover:bg-[#F3F5F7] p-2 rounded-lg"
        >
          {isOpen ? (
            <FiX size={20} strokeWidth={1.5} />
          ) : (
            <FiMaximize2 className="text-md md:text-xl" size={20} strokeWidth={1.5} />
          )}
        </button>
      </div>

      <nav className="mt-6">
        {navItems.map((item) => (
          <div key={item.title}>
            {/* Main Menu Item */}
            <Link to={item.route}>
              <div
                className="px-4 py-3 hover:bg-[#F3F5F7] cursor-pointer flex items-center justify-between"
                onClick={() =>
                  item.hasDropdown && isOpen
                    ? setActiveDropdown(
                        activeDropdown === item.title ? "" : item.title
                      )
                    : null
                }
              >
                <div className="flex items-center">
                  <item.icon size={20} strokeWidth={1.5} color="#000" />
                  <span
                    className={`ml-4 whitespace-nowrap overflow-hidden transition-all duration-300 ${
                      isOpen ? "w-32 opacity-100" : "w-0 opacity-0"
                    }`}
                  >
                    {item.title}
                  </span>
                </div>
                {item.hasDropdown && isOpen && (
                  <FiChevronDown
                    size={16}
                    strokeWidth={1.5}
                    className={`transition-transform duration-200 ${
                      activeDropdown === item.title ? "rotate-180" : ""
                    }`}
                  />
                )}
              </div>
            </Link>

            {/* Dropdown Items */}
            {item.hasDropdown && isOpen && activeDropdown === item.title && (
              <div className="bg-[#f5f5f5] overflow-hidden transition-all duration-200">
                {item.dropdownItems.map((dropdownItem) => (
                  <Link to={item.route} key={dropdownItem}>
                    <div className="px-11 py-2 hover:bg-[#f1f1f1] cursor-pointer text-sm">
                      {dropdownItem}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Menu;
