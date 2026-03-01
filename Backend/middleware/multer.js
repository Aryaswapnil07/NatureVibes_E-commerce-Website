import multer from "multer";
import fs from "fs";
import os from "os";
import path from "path";

// On Vercel, only /tmp is writable. Locally we keep /uploads in project root.
const uploadDir =
  process.env.VERCEL === "1"
    ? path.join(os.tmpdir(), "naturevibes-uploads")
    : path.resolve("uploads");

try {
  fs.mkdirSync(uploadDir, { recursive: true });
} catch (error) {
  console.error(`Unable to prepare upload directory "${uploadDir}":`, error);
  throw error;
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const safeName = path.basename(file.originalname).replace(/\s+/g, "");
    const uniqueName = `${Date.now()}-${safeName}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

export default upload;
