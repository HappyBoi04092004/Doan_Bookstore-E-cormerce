import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const getStorage = (subfolder: string) => multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join("uploads", subfolder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname.replace(/\s+/g, "_"));
  },
});

const fileFilter = (_req: any, file: any, cb: any) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png","image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ cho phép định dạng .png, .jpg, .jpeg và .webp!"), false);
  }
};

const commonConfig = {
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10,
  },
};

export const uploadAvatar = multer({
  storage: getStorage("avatar"),
  ...commonConfig,
});

export const uploadBook = multer({
  storage: getStorage("books"),
  ...commonConfig,
});

export const uploadCategory = multer({
  storage: getStorage("categories"),
  ...commonConfig,
});
