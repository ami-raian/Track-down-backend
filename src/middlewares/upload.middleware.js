const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

// Ensure the upload directory exists on the VPS disk
const uploadRoot = path.resolve(process.cwd(), env.upload.dir);
if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    const unique = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${unique}${ext}`);
  },
});

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function fileFilter(_req, file, cb) {
  if (ALLOWED.includes(file.mimetype)) return cb(null, true);
  return cb(ApiError.badRequest('Only JPG, PNG, WEBP and GIF images are allowed'));
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.upload.maxFileSizeMb * 1024 * 1024 },
});

/**
 * Build the public absolute URL for an uploaded file.
 */
function fileToUrl(filename) {
  return `${env.serverUrl}/${env.upload.dir}/${filename}`;
}

/**
 * Delete an uploaded image file from the VPS disk, given its public URL.
 * Only touches files that live inside our own upload directory (ignores
 * external URLs like imgbb). Safe to call with empty/unknown URLs.
 */
function deleteUploadByUrl(url) {
  if (!url || typeof url !== 'string') return false;

  const marker = `/${env.upload.dir}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return false; // not one of our uploads

  const filename = path.basename(url.slice(idx + marker.length));
  if (!filename) return false;

  // Guard against path traversal — resolved path must stay inside uploadRoot
  const filePath = path.resolve(uploadRoot, filename);
  if (!filePath.startsWith(uploadRoot)) return false;

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  } catch {
    /* ignore — best effort */
  }
  return false;
}

module.exports = { upload, fileToUrl, uploadRoot, deleteUploadByUrl };
