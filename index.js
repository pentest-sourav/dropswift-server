const express = require("express");
const cors = require("cors");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

require("dotenv").config();

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("DropSwift Backend Running 🚀");
});

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Memory Storage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
});

// Upload Route
app.post("/upload", upload.single("file"), async (req, res) => {

  try {

    if (!req.file) {

      return res.status(400).json({
        message: "No file uploaded",
      });

    }

    const isPdf =
      req.file.mimetype === "application/pdf";

    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: isPdf ? "raw" : "image",
        folder: "dropswift",
      },

      (error, uploadedFile) => {

        if (error) {

          console.log(error);

          return res.status(500).json({
            message: "Upload failed",
          });

        }

        let finalUrl = uploadedFile.secure_url;

        // FIX PDF URL
        if (isPdf) {

          finalUrl = finalUrl.replace(
            "/raw/upload/",
            "/raw/upload/fl_attachment/"
          );

        }

        return res.json({
          fileUrl: finalUrl,
        });

      }
    );

    stream.end(req.file.buffer);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Server Error",
    });

  }

});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT} 🚀`);
});