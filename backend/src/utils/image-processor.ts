import jsQR from "jsqr";
import path from "path";
import sharp from "sharp";
import sizeOf from "image-size";
import { promises as fs } from "fs";
import { uploadsDirectoryPath } from "../config";
import { ImageProcessingResult, QRCodeData } from "../types";

export async function processImage(
  imagePath: string
): Promise<ImageProcessingResult> {
  try {
    const imageBuffer = await fs.readFile(imagePath);
    const dimensions = sizeOf(imageBuffer);
    const stats = await fs.stat(imagePath);

    if (!dimensions.width || !dimensions.height) {
      throw new Error("Invalid image dimensions");
    }

    const imageDimensions = `${dimensions.width}x${dimensions.height}`;
    const imageSize = stats.size;

    const thumbnailPath = await generateThumbnail(imagePath);

    const qrCode = await processTestStrip(imageBuffer);

    return {
      thumbnailPath,
      imageDimensions,
      imageSize,
      qrCode,
    };
  } catch (error) {
    return {
      imageDimensions: "unknown",
      imageSize: 0,
    };
  }
}

async function generateThumbnail(imagePath: string): Promise<string> {
  const ext = path.extname(imagePath);
  const thumbnailFilename = `thumb_${Date.now()}${ext}`;
  const thumbnailPath = path.join(uploadsDirectoryPath, thumbnailFilename);

  await sharp(imagePath)
    .rotate()
    .resize(200, 200, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toFile(thumbnailPath);

  return thumbnailFilename;
}

async function processTestStrip(imageBuffer: Buffer): Promise<QRCodeData> {
  try {
    const sharpImg = sharp(imageBuffer).resize({
      width: 800,
      withoutEnlargement: true,
    });

    const { data, info } = await sharpImg
      .raw()
      .ensureAlpha()
      .toBuffer({ resolveWithObject: true });

    const imageData = new Uint8ClampedArray(data.buffer);

    const code = jsQR(imageData, info.width, info.height);

    if (!code) {
      return {
        status: "noQRCode",
        error: "QR code not found",
      };
    }

    const qrCode = code.data;

    const qrCodePattern = /^ELI-\d{4}-\d{3}$/;
    if (!qrCodePattern.test(qrCode)) {
      return {
        status: "invalid",
        error: "Invalid QR code format",
      };
    }

    const testStringYear = parseInt(qrCode.split("-")[1]);
    const currentYear = new Date().getFullYear();

    if (testStringYear >= currentYear) {
      return {
        qrCode,
        status: "valid",
      };
    }

    if (testStringYear < currentYear) {
      return {
        qrCode,
        status: "expired",
        error: "Test strip expired",
      };
    }

    return {
      status: "invalid",
      error: "Unknown QR code error",
    };
  } catch (error) {
    return {
      status: "invalid",
      error: "Error processing QR code",
    };
  }
}

export function validateImageFile(file: Express.Multer.File): {
  isValid: boolean;
  error?: string;
} {
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png"];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedMimes.includes(file.mimetype)) {
    return {
      isValid: false,
      error: "Invalid file type. Only JPG and PNG files are allowed.",
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "File size too large. Maximum size is 10MB.",
    };
  }

  return { isValid: true };
}
