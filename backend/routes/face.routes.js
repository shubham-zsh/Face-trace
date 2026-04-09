import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  uploadToDatabase,
  getDatabaseImages,
  deleteDatabaseImage,
} from '../controller/face.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const databaseFacesDir = path.join(__dirname, '..', 'database_faces');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, databaseFacesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

const faceRouter = Router();

faceRouter.post('/upload', upload.single('image'), uploadToDatabase);
faceRouter.get('/database', getDatabaseImages);
faceRouter.delete('/database/:filename', deleteDatabaseImage);

export default faceRouter;
