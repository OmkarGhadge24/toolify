const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  country: { type: String, required: true },
  email: { type: String, required: true },
  description: { type: String, required: true },
});

module.exports = mongoose.model("Contact", contactSchema);
