const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer
const upload = multer({
  dest: "uploads/",
});

// Upload Route
app.post("/upload", upload.single("file"), async (req, res) => {

  try {

    if (!req.file) {

      return res.status(400).json({
        message: "No file uploaded",
      });

    }

    // Original filename
    const originalName = path.parse(
      req.file.originalname
    ).name;

    // Extension
    const extension = path.extname(
      req.file.originalname
    );

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(
      req.file.path,
      {
        resource_type:
          req.file.mimetype === "application/pdf"
            ? "raw"
            : "image",

        folder: "dropswift",

        public_id: `${originalName}${extension}`,

        overwrite: true,
      }
    );

    // Delete temp file
    fs.unlinkSync(req.file.path);

    // Response
    return res.json({
      fileUrl: result.secure_url,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Upload failed",
    });

  }

});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT} 🚀`);
});