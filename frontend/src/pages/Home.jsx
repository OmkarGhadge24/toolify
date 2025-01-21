import React from "react";
import Navbar from "./../components/Navbar";
import Menu from "../components/Menu";

const Home = () => {
  return (
    <div className="md:flex h-full overflow-hidden">
      <div className="w-full md:w-1/6">
        <Menu />
      </div>

      <div className="w-full md:w-5/6 flex flex-col gap-4">
        <div className="w-full ">
          <Navbar />
        </div>
        <div className="w-full flex-grow">2</div>
      </div>
    </div>
  );
};

export default Home;
