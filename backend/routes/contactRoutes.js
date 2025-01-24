const express = require("express");
const Contact = require("../models/Contact");

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, age, country, email, description } = req.body;

  try {
    const newContact = new Contact({ name, age, country, email, description });
    await newContact.save();
    res.status(201).json({ message: "Form submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit form", error });
  }
});

module.exports = router;
