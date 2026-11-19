// middleware/uploadMiddleware.js
// Configures Multer for handling file uploads.
// Files are saved to the /uploads folder.
// Only jpg, jpeg, png, and pdf are allowed. Max size: 5 MB.

const multer = require('multer');
const path   = require('path');

// ─── Storage Configuration ─────────────────────────────────────────────────────
// diskStorage tells Multer to save files on the disk (not in memory)
const storage = multer.diskStorage({

  // destination: folder where uploaded files are saved
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save to the /uploads folder
  },

  // filename: what to name the saved file
  // We use Date.now() + original extension to avoid name conflicts
  filename: (req, file, cb) => {
    const ext      = path.extname(file.originalname); // e.g. ".pdf"
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '-'); // Remove spaces
    cb(null, `${baseName}-${Date.now()}${ext}`);
    // Example output: "report-1699876543210.pdf"
  },
});

// ─── File Filter ───────────────────────────────────────────────────────────────
// Only allow specific file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;

  // Check MIME type (e.g. "image/jpeg") and file extension (e.g. ".jpg")
  const mimeOk = allowedTypes.test(file.mimetype);
  const extOk  = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimeOk && extOk) {
    cb(null, true);   // Accept the file
  } else {
    // Reject the file — this error is caught by the error middleware
    cb(new Error('Only JPG, PNG, and PDF files are allowed.'), false);
  }
};

// ─── Create Multer Upload Instance ────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB maximum file size
  },
});

module.exports = { upload };
