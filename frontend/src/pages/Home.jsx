import React, { useState } from "react";
import Navbar from "./../components/Navbar";
import Menu from "../components/Menu";

const Home = () => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="w-full flex-1 transition-all duration-300 bg-[#dadada] h-full overflow-hidden">
      <div className="bg-white w-full border-2 rounded-md border-[rgba(0,0,0,0.08)] h-full shadow-sm flex">
        <Menu isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className="w-full flex flex-col gap-4 bg-white border-2 rounded-md border-[rgba(0,0,0,0.08)] ">
          <div className="w-full">
            <Navbar />
          </div>
          <div className="w-full flex-grow">2</div>
        </div>
      </div>
    </div>
  );
};

export default Home;
