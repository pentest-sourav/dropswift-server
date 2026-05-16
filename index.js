const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

require("dotenv").config();

const app = express();

// CORS
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
}));

app.use(express.json());

// Health Route
app.get("/", (req, res) => {
  res.send("DropSwift Backend Running 🚀");
});

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Disk Storage
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

    const result = await cloudinary.uploader.upload(
      req.file.path,
      {
        resource_type: "auto",
        folder: "dropswift",
      }
    );

    // delete temp file
    fs.unlinkSync(req.file.path);

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

// PORT
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on ${PORT} 🚀`);
});