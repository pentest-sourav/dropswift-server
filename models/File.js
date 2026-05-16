const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  shortId: String,
  fileUrl: String,
});

module.exports = mongoose.model(
  "File",
  fileSchema
);