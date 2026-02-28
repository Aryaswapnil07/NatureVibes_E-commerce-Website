import multer from "multer";
import fs from "fs";
import path from "path";

// Create uploads folder if not exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Save inside project/uploads
  },
  filename: function (req, file, cb) {
    // Remove spaces and add unique name
    const uniqueName =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "");
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

export default upload;