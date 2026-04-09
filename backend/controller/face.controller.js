import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FACES_DIR = path.join(__dirname, '..', 'database_faces');

if (!fs.existsSync(DB_FACES_DIR)) {
  fs.mkdirSync(DB_FACES_DIR, { recursive: true });
}

export const uploadToDatabase = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error('No image file provided');
      error.statusCode = 400;
      throw error;
    }

    res.status(201).json({
      success: true,
      message: 'Image uploaded to database',
      data: {
        filename: req.file.filename,
        path: `/database_faces/${req.file.filename}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDatabaseImages = async (req, res, next) => {
  try {
    const files = fs.readdirSync(DB_FACES_DIR);
    const images = files
      .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
      .map((f) => ({
        filename: f,
        url: `http://localhost:5555/database_faces/${f}`,
      }));
    res.status(200).json({ success: true, count: images.length, data: images });
  } catch (error) {
    next(error);
  }
};

export const deleteDatabaseImage = async (req, res, next) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(DB_FACES_DIR, filename);

    if (!fs.existsSync(filePath)) {
      const error = new Error('Image not found');
      error.statusCode = 404;
      throw error;
    }

    fs.unlinkSync(filePath);
    res.status(200).json({ success: true, message: 'Image deleted' });
  } catch (error) {
    next(error);
  }
};
