const express = require("express");
const cors = require("cors");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

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

    const result = await cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        folder: "dropswift",
      },
      (error, uploadedFile) => {

        if (error) {

          console.log(error);

          return res.status(500).json({
            message: "Upload failed",
          });

        }

        return res.json({
          fileUrl: uploadedFile.secure_url,
        });

      }
    );

    result.end(req.file.buffer);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });

  }

});

// Start Server
app.listen(5000, () => {
  console.log("Server running 🚀");
});