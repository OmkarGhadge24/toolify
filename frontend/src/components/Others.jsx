import React from 'react';
import { FiGithub, FiLinkedin } from 'react-icons/fi';

const Others = () => {
  return (
    <div className="p-4">
      <h1 className="text-xl md:text-2xl font-bold mb-4">My Intro</h1>
      <p className="text-md md:text-lg mb-4">
        Welcome to my project! As a full-stack developer, I have worked on several projects
        that demonstrate my ability to build both frontend and backend solutions. These projects 
        utilize a range of technologies including React, Node.js, MongoDB, and more.
      </p>
      <p className="text-md md:text-lg mb-4">
        Feel free to check out more of my work and get in touch with me through the links below. 
        I am always open to new opportunities, collaborations, and discussions!
      </p>
      
      <div className="flex gap-4 mt-6 text-md md:text-lg ">
        <a href="https://github.com/OmkarGhadge24" target="_blank" rel="noopener noreferrer">
          <FiGithub size={30} className="hover:text-yellow-600 transition-colors duration-300" />
        </a>
        <a href="https://linkedin.com/in/omkar-ghadge-996b80317" target="_blank" rel="noopener noreferrer">
          <FiLinkedin size={30} className="hover:text-blue-600 transition-colors duration-300" />
        </a>
      </div>
    </div>
  );
};

export default Others;
