const express = require("express");
const cors = require("cors");
const multer = require("multer");
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

    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        folder: "dropswift",
        use_filename: true,
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

    stream.end(req.file.buffer);

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Server Error",
    });

  }

});

// PORT
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on ${PORT} 🚀`);
});