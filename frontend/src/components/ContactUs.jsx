import React, { useState } from "react";
import { MdOutlineEmail } from "react-icons/md";
import { IoLogoGithub, IoLogoLinkedin } from "react-icons/io";
import { useTheme } from "../context/ThemeContext";

const ContactUs = () => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    country: "",
    email: "",
    description: "",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required.";
    if (!formData.age || isNaN(formData.age))
      newErrors.age = "Please enter a valid age.";
    if (!formData.country) newErrors.country = "Country is required.";
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Please enter a valid email.";
    if (!formData.description)
      newErrors.description = "Please provide a description or issue.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await fetch("http://localhost:5000/api/contacts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Failed to submit form");
        }

        const data = await response.json();
        alert("Form submitted successfully!");

        // Reset form
        setFormData({
          name: "",
          age: "",
          country: "",
          email: "",
          description: "",
        });
      } catch (error) {
        alert("Failed to submit form. Please try again.");
        console.error("Error submitting form:", error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div
      className={`p-4 max-w-2xl mx-auto ${
        theme === "light" ? "text-black" : "text-white"
      }`}
    >
      <h1 className="text-2xl font-bold mb-4 text-center">Contact Us</h1>

      {/* Contact Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block font-semibold mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                theme === "light"
                  ? "bg-white border-gray-300 text-black"
                  : "bg-[#252942] border-gray-600 text-white"
              }`}
              placeholder="Enter your name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="age" className="block font-semibold mb-2">
              Age
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                theme === "light"
                  ? "bg-white border-gray-300 text-black"
                  : "bg-[#252942] border-gray-600 text-white"
              }`}
              placeholder="Enter your age"
            />
            {errors.age && (
              <p className="text-red-500 text-sm mt-1">{errors.age}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                theme === "light"
                  ? "bg-white border-gray-300 text-black"
                  : "bg-[#252942] border-gray-600 text-white"
              }`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="country" className="block font-semibold mb-2">
              Country
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                theme === "light"
                  ? "bg-white border-gray-300 text-black"
                  : "bg-[#252942] border-gray-600 text-white"
              }`}
              placeholder="Enter your country"
            />
            {errors.country && (
              <p className="text-red-500 text-sm mt-1">{errors.country}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block font-semibold mb-2">
            Description/Issue
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none resize-none ${
              theme === "light"
                ? "bg-white border-gray-300 text-black"
                : "bg-[#252942] border-gray-600 text-white"
            }`}
            placeholder="Describe your issue or request"
            rows="5"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        <div className="text-center">
          <button
            type="submit"
            className={`w-full py-2 rounded-lg focus:outline-none bg-[#3B40E8] hover:bg-[#2D31B3] text-white
            `}
          >
            Submit
          </button>
        </div>
      </form>

      {/* Social Media Icons */}
      <div className="flex gap-4 justify-center mt-6 flex-row">
        <a
          href="mailto:omkarghadge68@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          className={theme === "light" ? "text-black" : "text-white"}
        >
          <MdOutlineEmail
            size={30}
            className="hover:text-green-500 transition-colors duration-300"
          />
        </a>
        <a
          href="https://linkedin.com/in/omkar-ghadge-996b80317"
          target="_blank"
          rel="noopener noreferrer"
          className={theme === "light" ? "text-black" : "text-white"}
        >
          <IoLogoLinkedin
            size={30}
            className="hover:text-blue-600 transition-colors duration-300"
          />
        </a>
        <a
          href="https://github.com/OmkarGhadge24"
          target="_blank"
          rel="noopener noreferrer"
          className={theme === "light" ? "text-black" : "text-white"}
        >
          <IoLogoGithub
            size={30}
            className="hover:text-yellow-600 transition-colors duration-300"
          />
        </a>
      </div>
    </div>
  );
};

export default ContactUs;
