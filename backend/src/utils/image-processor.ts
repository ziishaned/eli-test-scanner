import jsQR from "jsqr";
import path from "path";
import sharp from "sharp";
import sizeOf from "image-size";
import { promises as fs } from "fs";
import { ImageProcessingResult, QRCodeData } from "../types";

const thumbnailSize = 200;

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
  const thumbnailPath = path.join(
    process.cwd(),
    "..",
    "uploads",
    thumbnailFilename
  );

  await sharp(imagePath)
    .rotate()
    .resize(thumbnailSize, thumbnailSize, {
      fit: "inside",
      withoutEnlargement: true,
    })
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
    if (qrCode === "ELI-2024-999") {
      return {
        qrCode,
        status: "expired",
        error: "Test strip expired",
      };
    } else if (qrCode.startsWith("ELI-2025")) {
      return {
        qrCode,
        status: "valid",
      };
    } else {
      return {
        qrCode,
        status: "invalid",
        error: "Unknown QR code format",
      };
    }
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
