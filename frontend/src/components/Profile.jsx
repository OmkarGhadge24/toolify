import React from "react";
import { Link } from "react-router-dom";

const Profile = ({ user }) => {
  if (!user || !user.isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-xl font-semibold mb-4">You need to log in </h2>
        <Link
          to="/login"
          className="text-blue-500 underline hover:text-blue-700"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  const maleImage = "/images/male.png";
  const femaleImage = "/images/female.png";

  return (
    <div className="flex flex-col items-center mt-10 p-4">
      <img
        src={user.gender === "male" ? maleImage : femaleImage}
        alt="Profile"
        className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover mb-4 border-2 border-[#dadada] "
      />
      <h1 className="text-xl md:text-2xl font-bold mb-2">{user.name}</h1>
      <p className="text-md md:text-lg text-gray-600">{user.email}</p>
    </div>
  );
};

export default Profile;
