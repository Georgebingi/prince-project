/* eslint-env node */
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use a temporary directory for initial upload
// The file will be moved to the correct case folder in the route handler
const tempUploadPath = path.join(__dirname, '..', 'public', 'documents', 'temp');

// Create temp folder if it doesn't exist
if (!fs.existsSync(tempUploadPath)) {
  fs.mkdirSync(tempUploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use temp directory - caseId will be available in req.body after multer processes the file
    cb(null, tempUploadPath);
  },
  filename: (req, file, cb) => {
    // Add timestamp to avoid duplicate filenames
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'application/zip'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, PNG, ZIP allowed.'), false);
  }
};

// Create upload middleware that handles file and fields together
const upload = multer({
  storage: storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024 },
  fileFilter: fileFilter
});

// Export a function that creates the final upload middleware with proper disk storage
export const createUploadMiddleware = () => {
  return multer({
    storage,
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024 },
    fileFilter: fileFilter
  });
};

export default upload;
