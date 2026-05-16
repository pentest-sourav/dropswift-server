const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const mongoose = require("mongoose");
const { nanoid } = require("nanoid");
const cloudinary = require("cloudinary").v2;

require("dotenv").config();

const File = require("./models/File");

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected ✅");
  })
  .catch((err) => {
    console.log(err);
  });

// Test Route
app.get("/", (req, res) => {
  res.send("DropSwift Backend Running 🚀");
});

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Storage
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

    // PDF detect
    const isPdf =
      req.file.mimetype === "application/pdf";

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(
      req.file.path,
      {
        resource_type:
          isPdf ? "raw" : "image",

        folder: "dropswift",

        use_filename: true,

        unique_filename: true,

        filename_override:
          req.file.originalname,
      }
    );

    // Delete temp file
    fs.unlinkSync(req.file.path);

    // Generate short ID
    const shortId = nanoid(6);

    // Save in MongoDB
    const newFile = new File({
      shortId,
      fileUrl: result.secure_url,
    });

    await newFile.save();

    // Return short link
    return res.json({
      shortLink:
        `https://dropswift-seven.vercel.app/file/${shortId}`,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Upload failed",
    });

  }

});

// Redirect Route
app.get("/file/:id", async (req, res) => {

  try {

    const file = await File.findOne({
      shortId: req.params.id,
    });

    if (!file) {

      return res.status(404).json({
        message: "File not found",
      });

    }

    // Fix PDF downloads
    if (
      file.fileUrl.includes("/raw/upload/")
    ) {

      const fixedUrl =
        file.fileUrl.replace(
          "/raw/upload/",
          "/raw/upload/fl_attachment/"
        );

      return res.redirect(fixedUrl);

    }

    // Images
    return res.redirect(file.fileUrl);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Server Error",
    });

  }

});

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on ${PORT} 🚀`
  );
});