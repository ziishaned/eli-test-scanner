import { Express } from "express";
import path from "path";
import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { randomUUID } from "crypto";
import { appConfig } from "../config";
import { BadRequestError } from "../errors/bad-request-error";

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, appConfig.uploadsDirPath);
  },
  filename: (req: Request, file, cb) => {
    const uniqueName = `${randomUUID()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

function fileFilter(
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) {
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png"];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    throw new BadRequestError("Invalid file type");
  }
}

export const testStripImageUpload = multer({
  storage,
  fileFilter,
  limits: {
    files: 1,
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});
