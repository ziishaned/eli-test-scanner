import sharp from "sharp";
import jsQR from "jsqr";
import { promises as fs } from "fs";
import path from "path";
import sizeOf from "image-size";
import { QRCodeData, ImageProcessingResult } from "../types";

export class ImageProcessor {
  private static readonly THUMBNAIL_SIZE = 200;
  private static readonly QR_CODE_PATTERN = /^ELI-(\d{4})-\w+$/;
  private static readonly CURRENT_YEAR = new Date().getFullYear();

  /**
   * Process uploaded image: validate, generate thumbnail, extract QR code
   */
  static async processImage(
    imagePath: string,
    filename: string
  ): Promise<ImageProcessingResult> {
    try {
      // Get image metadata
      const imageBuffer = await fs.readFile(imagePath);
      const dimensions = sizeOf(imageBuffer);
      const stats = await fs.stat(imagePath);

      if (!dimensions.width || !dimensions.height) {
        throw new Error("Invalid image dimensions");
      }

      const imageDimensions = `${dimensions.width}x${dimensions.height}`;
      const imageSize = stats.size;

      // Generate thumbnail
      const thumbnailPath = await this.generateThumbnail(imagePath, filename);

      // Extract QR code
      const qrCode = await this.extractQRCode(imagePath);

      // Determine quality based on QR code and image properties
      const quality = this.determineQuality(qrCode, dimensions);

      return {
        thumbnailPath,
        imageDimensions,
        imageSize,
        qrCode,
        quality,
      };
    } catch (error) {
      console.error("Image processing failed:", error);
      return {
        imageDimensions: "unknown",
        imageSize: 0,
        quality: "failed",
      };
    }
  }

  /**
   * Generate thumbnail using Sharp
   */
  private static async generateThumbnail(
    imagePath: string,
    originalFilename: string
  ): Promise<string> {
    const ext = path.extname(originalFilename);
    const thumbnailFilename = `thumb_${Date.now()}${ext}`;
    const thumbnailPath = path.join(
      process.cwd(),
      "uploads",
      "thumbnails",
      thumbnailFilename
    );

    await sharp(imagePath)
      .resize(this.THUMBNAIL_SIZE, this.THUMBNAIL_SIZE, {
        fit: "cover",
        position: "center",
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    return thumbnailFilename;
  }

  /**
   * Extract QR code from image using jsQR
   */
  private static async extractQRCode(
    imagePath: string
  ): Promise<QRCodeData | undefined> {
    try {
      // Convert image to raw pixel data using Sharp
      const { data, info } = await sharp(imagePath)
        .raw()
        .ensureAlpha()
        .toBuffer({ resolveWithObject: true });

      // Create Uint8ClampedArray for jsQR
      const imageData = new Uint8ClampedArray(data.buffer);

      // Scan for QR code
      const code = jsQR(imageData, info.width, info.height);

      if (!code) {
        return undefined;
      }

      // Validate QR code format and expiration
      const qrData = code.data;
      const isValid = this.validateQRCodeFormat(qrData);
      const isExpired = this.isQRCodeExpired(qrData);

      return {
        data: qrData,
        isValid,
        isExpired,
      };
    } catch (error) {
      console.error("QR code extraction failed:", error);
      return undefined;
    }
  }

  /**
   * Validate QR code format (ELI-YYYY-XXX)
   */
  private static validateQRCodeFormat(qrData: string): boolean {
    return this.QR_CODE_PATTERN.test(qrData);
  }

  /**
   * Check if QR code is expired based on year
   */
  private static isQRCodeExpired(qrData: string): boolean {
    const match = qrData.match(this.QR_CODE_PATTERN);
    if (!match) return true;

    const year = parseInt(match[1]);
    return year < this.CURRENT_YEAR;
  }

  /**
   * Determine image quality based on QR code and image properties
   */
  private static determineQuality(
    qrCode: QRCodeData | undefined,
    dimensions: { width?: number; height?: number }
  ): "good" | "poor" | "failed" {
    if (!dimensions.width || !dimensions.height) {
      return "failed";
    }

    // Consider image too small if less than 200x200
    const isImageTooSmall = dimensions.width < 200 || dimensions.height < 200;

    if (!qrCode) {
      return isImageTooSmall ? "failed" : "poor";
    }

    if (!qrCode.isValid || qrCode.isExpired) {
      return "poor";
    }

    return isImageTooSmall ? "poor" : "good";
  }

  /**
   * Validate uploaded file
   */
  static validateImageFile(file: Express.Multer.File): {
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
}
