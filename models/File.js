const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  fileUrl: String,
  shortId: String,
});

module.exports = mongoose.model("File", fileSchema);