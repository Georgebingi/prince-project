/* eslint-env node */
import multer from 'multer';

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store in memory before uploading to cloud

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

const upload = multer({
  storage: storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024 }, // 50MB
  fileFilter: fileFilter
});

export default upload;
