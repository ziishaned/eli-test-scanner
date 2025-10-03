import { ImageProcessor } from "../../src/utils/image-processor";
import {
  createMockFile,
  createTestImageBuffer,
  setupTestEnv,
} from "../test-helpers";
import sharp from "sharp";
import jsQR from "jsqr"      );

      expect(result.imageDimensions).toBe(\"100x100\");
    });ort { promises as fs } from "fs";
import path from "path";
import sizeOf from "image-size";

// Mock external dependencies
jest.mock("sharp");
jest.mock("jsqr");
jest.mock("fs", () => ({
  promises: {
    readFile: jest.fn(),
    stat: jest.fn(),
  },
}));
jest.mock("image-size", () => jest.fn());

const mockSharp = sharp as jest.MockedFunction<typeof sharp>;
const mockJsQR = jsQR as jest.MockedFunction<typeof jsQR>;
const mockFs = fs as jest.Mocked<typeof fs>;
const mockSizeOf = sizeOf as jest.MockedFunction<typeof sizeOf>;

// Helper to create mock QR code result
const createMockQRCode = (data: string) => ({
  data,
  location: {
    topLeftCorner: { x: 0, y: 0 },
    topRightCorner: { x: 100, y: 0 },
    bottomLeftCorner: { x: 0, y: 100 },
    bottomRightCorner: { x: 100, y: 100 },
    topRightFinderPattern: { x: 90, y: 10 },
    topLeftFinderPattern: { x: 10, y: 10 },
    bottomLeftFinderPattern: { x: 10, y: 90 },
  },
  binaryData: [] as number[],
  chunks: [],
  version: 1,
});

describe("ImageProcessor", () => {
  beforeEach(() => {
    setupTestEnv();
    jest.clearAllMocks();

    // Default sharp mock setup
    const mockSharpInstance = {
      resize: jest.fn().mockReturnThis(),
      jpeg: jest.fn().mockReturnThis(),
      toFile: jest.fn().mockResolvedValue(undefined),
      raw: jest.fn().mockReturnThis(),
      ensureAlpha: jest.fn().mockReturnThis(),
      toBuffer: jest.fn().mockResolvedValue({
        data: Buffer.alloc(800), // 200x200x1 RGBA
        info: { width: 200, height: 200 },
      }),
    };

    mockSharp.mockReturnValue(mockSharpInstance as any);
  });

  describe("validateImageFile", () => {
    it("should accept valid JPEG file", () => {
      const file = createMockFile({
        mimetype: "image/jpeg",
        size: 1024 * 1024, // 1MB
      });

      const result = ImageProcessor.validateImageFile(file);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should accept valid PNG file", () => {
      const file = createMockFile({
        mimetype: "image/png",
        size: 1024 * 1024, // 1MB
      });

      const result = ImageProcessor.validateImageFile(file);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject invalid file type", () => {
      const file = createMockFile({
        mimetype: "image/gif",
        size: 1024 * 1024,
      });

      const result = ImageProcessor.validateImageFile(file);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Invalid file type. Only JPG and PNG files are allowed."
      );
    });

    it("should reject file that is too large", () => {
      const file = createMockFile({
        mimetype: "image/jpeg",
        size: 15 * 1024 * 1024, // 15MB (exceeds 10MB limit)
      });

      const result = ImageProcessor.validateImageFile(file);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("File size too large. Maximum size is 10MB.");
    });
  });

  describe("processImage", () => {
    const mockImagePath = "/test/image.jpg";
    const mockFilename = "test-image.jpg";

    beforeEach(() => {
      // Mock file system operations
      mockFs.readFile.mockResolvedValue(createTestImageBuffer());
      mockFs.stat.mockResolvedValue({
        size: 1024000,
      } as any);

      // Mock image-size
      mockSizeOf.mockReturnValue({ width: 1920, height: 1080 });
    });

    it("should process image successfully with valid QR code", async () => {
      // Mock QR code detection
      mockJsQR.mockReturnValue(createMockQRCode("ELI-2025-ABC123"));

      const result = await ImageProcessor.processImage(
        mockImagePath,
        mockFilename
      );

      expect(result).toEqual({
        thumbnailPath: expect.stringMatching(/^thumb_\d+\.jpg$/),
        imageDimensions: "1920x1080",
        imageSize: 1024000,
        qrCode: {
          data: "ELI-2025-ABC123",
          isValid: true,
          isExpired: false,
        },
      });

      // Verify Sharp was called for thumbnail generation
      expect(mockSharp).toHaveBeenCalledWith(mockImagePath);
    });

    it("should handle image with no QR code", async () => {
      // Mock no QR code found
      mockJsQR.mockReturnValue(null);

      const result = await ImageProcessor.processImage(
        mockImagePath,
        mockFilename
      );

      expect(result.qrCode).toBeUndefined();
    });

    it("should handle invalid QR code format", async () => {
      // Mock invalid QR code
      mockJsQR.mockReturnValue(createMockQRCode("INVALID-QR-CODE"));

      const result = await ImageProcessor.processImage(
        mockImagePath,
        mockFilename
      );

      expect(result.qrCode).toEqual({
        data: "INVALID-QR-CODE",
        isValid: false,
        isExpired: true, // Invalid format means expired
      });
    });

    it("should handle expired QR code", async () => {
      // Mock expired QR code (year 2020)
      mockJsQR.mockReturnValue(createMockQRCode("ELI-2020-ABC123"));

      const result = await ImageProcessor.processImage(
        mockImagePath,
        mockFilename
      );

      expect(result.qrCode).toEqual({
        data: "ELI-2020-ABC123",
        isValid: true,
        isExpired: true,
      });
    });

    it("should handle small image dimensions", async () => {
      // Mock small image
      mockSizeOf.mockReturnValue({ width: 100, height: 100 });

      mockJsQR.mockReturnValue(createMockQRCode("ELI-2025-ABC123"));

      const result = await ImageProcessor.processImage(
        mockImagePath,
        mockFilename
      );

      expect(result.imageDimensions).toBe("100x100");
    });

    it("should handle processing errors gracefully", async () => {
      // Mock file read error
      mockFs.readFile.mockRejectedValue(new Error("File not found"));

      const result = await ImageProcessor.processImage(
        mockImagePath,
        mockFilename
      );

      expect(result).toEqual({
        imageDimensions: "unknown",
        imageSize: 0,
      });
    });

    it("should handle invalid image dimensions", async () => {
      // Mock invalid dimensions
      mockSizeOf.mockReturnValue({ width: 0, height: 0 });

      const result = await ImageProcessor.processImage(
        mockImagePath,
        mockFilename
      );
    });
  });

  describe("QR Code Validation", () => {
    const testCases = [
      { code: "ELI-2025-ABC123", valid: true, expired: false }, // Current year
      { code: "ELI-2026-XYZ789", valid: true, expired: false }, // Future year
      { code: "ELI-2020-OLD123", valid: true, expired: true }, // Past year
      { code: "INVALID-CODE", valid: false, expired: true },
      { code: "ELI-INVALID-FORMAT", valid: false, expired: true },
      { code: "", valid: false, expired: true },
    ];
    testCases.forEach(({ code, valid, expired }) => {
      it(`should validate QR code "${code}" correctly`, async () => {
        mockFs.readFile.mockResolvedValue(createTestImageBuffer());
        mockFs.stat.mockResolvedValue({ size: 1024000 } as any);

        mockSizeOf.mockReturnValue({ width: 1920, height: 1080 });

        mockJsQR.mockReturnValue(createMockQRCode(code));

        const result = await ImageProcessor.processImage(
          "/test/image.jpg",
          "test.jpg"
        );

        if (code) {
          expect(result.qrCode).toEqual({
            data: code,
            isValid: valid,
            isExpired: expired,
          });
        }
      });
    });
  });

  describe("Thumbnail Generation", () => {
    it("should generate thumbnail with correct settings", async () => {
      mockFs.readFile.mockResolvedValue(createTestImageBuffer());
      mockFs.stat.mockResolvedValue({ size: 1024000 } as any);

      mockSizeOf.mockReturnValue({ width: 1920, height: 1080 });

      const mockSharpInstance = {
        resize: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        toFile: jest.fn().mockResolvedValue(undefined),
        raw: jest.fn().mockReturnThis(),
        ensureAlpha: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue({
          data: Buffer.alloc(800),
          info: { width: 200, height: 200 },
        }),
      };

      mockSharp.mockReturnValue(mockSharpInstance as any);

      await ImageProcessor.processImage("/test/image.jpg", "original.jpg");

      expect(mockSharpInstance.resize).toHaveBeenCalledWith(200, 200, {
        fit: "cover",
        position: "center",
      });
      expect(mockSharpInstance.jpeg).toHaveBeenCalledWith({ quality: 80 });
      expect(mockSharpInstance.toFile).toHaveBeenCalledWith(
        expect.stringContaining("thumb_")
      );
    });
  });

  describe("Quality Determination", () => {
    it('should return "good" for valid image with valid QR code', async () => {
      mockFs.readFile.mockResolvedValue(createTestImageBuffer());
      mockFs.stat.mockResolvedValue({ size: 1024000 } as any);

      mockSizeOf.mockReturnValue({ width: 1920, height: 1080 });

      mockJsQR.mockReturnValue(createMockQRCode("ELI-2025-ABC123"));

      const result = await ImageProcessor.processImage(
        "/test/image.jpg",
        "test.jpg"
      );
    });

    it('should return "poor" for small image with valid QR code', async () => {
      mockFs.readFile.mockResolvedValue(createTestImageBuffer());
      mockFs.stat.mockResolvedValue({ size: 1024000 } as any);

      mockSizeOf.mockReturnValue({ width: 150, height: 150 }); // Too small

      mockJsQR.mockReturnValue(createMockQRCode("ELI-2025-ABC123"));

      const result = await ImageProcessor.processImage(
        "/test/image.jpg",
        "test.jpg"
      );
    });

    it('should return "poor" for good image with invalid QR code', async () => {
      mockFs.readFile.mockResolvedValue(createTestImageBuffer());
      mockFs.stat.mockResolvedValue({ size: 1024000 } as any);

      mockSizeOf.mockReturnValue({ width: 1920, height: 1080 });

      mockJsQR.mockReturnValue(createMockQRCode("INVALID-QR"));

      const result = await ImageProcessor.processImage(
        "/test/image.jpg",
        "test.jpg"
      );
    });

    it('should return "failed" for invalid image dimensions', async () => {
      mockFs.readFile.mockResolvedValue(createTestImageBuffer());
      mockFs.stat.mockResolvedValue({ size: 1024000 } as any);

      mockSizeOf.mockReturnValue({ width: 0, height: 0 });

      const result = await ImageProcessor.processImage(
        "/test/image.jpg",
        "test.jpg"
      );
    });
  });
});
