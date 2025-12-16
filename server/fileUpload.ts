import multer from "multer";
import path from "path";
import fs from "fs";
import { randomBytes } from "crypto";

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const EMPLOYER_DOCS_DIR = path.join(UPLOADS_DIR, "employer-documents");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

if (!fs.existsSync(EMPLOYER_DOCS_DIR)) {
  fs.mkdirSync(EMPLOYER_DOCS_DIR, { recursive: true });
}

// Storage configuration for employer documents
const employerDocsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, EMPLOYER_DOCS_DIR);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = `${Date.now()}-${randomBytes(6).toString("hex")}`;
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const sanitized = basename.replace(/[^a-zA-Z0-9-_]/g, "_");
    cb(null, `${sanitized}-${uniqueSuffix}${ext}`);
  },
});

// File filter for documents (PDF, images)
const documentFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF, JPEG, JPG, PNG, and GIF are allowed."));
  }
};

// Multer upload instance for employer documents
export const uploadEmployerDocs = multer({
  storage: employerDocsStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: documentFilter,
});

// Helper to get file URL
export function getFileUrl(filename: string): string {
  return `/uploads/employer-documents/${filename}`;
}

// Helper to delete a file
export function deleteFile(filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const fullPath = path.join(process.cwd(), filepath);
    fs.unlink(fullPath, (err) => {
      if (err && err.code !== "ENOENT") {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Helper to format file metadata
export function formatFileMetadata(file: Express.Multer.File) {
  return {
    name: file.originalname,
    filename: file.filename,
    path: getFileUrl(file.filename),
    type: file.mimetype,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  };
}
