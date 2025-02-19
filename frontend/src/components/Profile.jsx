import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";

const Profile = ({ isAuthenticated }) => {
  const { theme } = useTheme();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/api/auth/me", {
          withCredentials: true,
        });
        setUserData(response.data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        if (error.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
          theme === "light" ? "border-blue-500" : "border-[#3B40E8]"
        }`}></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[60vh] p-4 ${
        theme === "light" ? "text-black" : "text-white"
      }`}>
        <h2 className="text-2xl font-semibold mb-4">
          Please log in to view your profile
        </h2>
        <Link
          to="/login"
          className={`px-6 py-2 rounded-md transition-colors text-white ${
            theme === "light"
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-[#3B40E8] hover:bg-[#2D31B3]"
          }`}
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className={`max-w-2xl mx-auto mt-10 p-6 rounded-lg ${
      theme === "light"
        ? "bg-white text-black"
        : "bg-[#1a1b2e] text-white"
    }`}>
      <div className="flex flex-col items-center mb-8">
        <div className={`w-32 h-32 rounded-full mb-4 overflow-hidden ${
          theme === "light" ? "bg-gray-200" : "bg-[#252942]"
        }`}>
          <img
            src={
              userData?.gender === "male"
                ? "/images/male.png"
                : userData?.gender === "female"
                ? "/images/female.png"
                : "/images/other.png"
            }
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className={`text-2xl font-bold ${
          theme === "light" ? "text-gray-800" : "text-white"
        }`}>
          {userData?.name}
        </h1>
        <p className={
          theme === "light" ? "text-gray-600" : "text-gray-300"
        }>
          {userData?.email}
        </p>
      </div>
    </div>
  );
};

export default Profile;
