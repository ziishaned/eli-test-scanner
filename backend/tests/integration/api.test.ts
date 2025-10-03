import request from "supertest";
import express from "express";
import cors from "cors";
import path from "path";
import { promises as fs } from "fs";

import testStripRoutes from "../../src/routes/test-strip-routes";
import {
  errorHandler,
  notFoundHandler,
} from "../../src/middleware/error-handler";
import {
  createTestImageBuffer,
  createMockImageProcessingResult,
  setupTestEnv,
} from "../test-helpers";
import { SubmissionStatus } from "../../src/types";

// Mock all dependencies
jest.mock("../../src/database", () => ({
  pool: {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
  },
}));

jest.mock("../../src/utils/image-processor");
jest.mock("../../src/models/test-strip-model");

// Set up Express app for testing
const createTestApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/uploads", express.static(path.join(__dirname, "../fixtures")));
  app.use("/api/test-strips", testStripRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

describe("Test Strip API Integration Tests", () => {
  let app: express.Application;
  let mockImageProcessor: jest.Mocked<
    typeof import("../../src/utils/image-processor").ImageProcessor
  >;
  let mockTestStripModel: jest.Mocked<
    typeof import("../../src/models/test-strip-model").TestStripModel
  >;

  beforeEach(() => {
    setupTestEnv();
    app = createTestApp();

    // Get mocked modules
    mockImageProcessor =
      require("../../src/utils/image-processor").ImageProcessor;
    mockTestStripModel =
      require("../../src/models/test-strip-model").TestStripModel;

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe("POST /api/test-strips/upload", () => {
    it("should upload and process image successfully", async () => {
      const testImageBuffer = createTestImageBuffer();

      // Mock successful image processing
      mockImageProcessor.validateImageFile.mockReturnValue({ isValid: true });
      mockImageProcessor.processImage.mockResolvedValue(
        createMockImageProcessingResult()
      );

      // Mock successful database save
      mockTestStripModel.create.mockResolvedValue({
        id: "test-id-123",
        qr_code: "ELI-2024-ABC123",
        original_image_path: "test-image.jpg",
        thumbnail_path: "thumb_test.jpg",
        image_size: 1024000,
        image_dimensions: "1920x1080",
        status: "completed",
        error_message: undefined,
        created_at: new Date("2024-01-01T00:00:00Z"),
      });

      const response = await request(app)
        .post("/api/test-strips/upload")
        .attach("image", testImageBuffer, {
          filename: "test-image.jpg",
          contentType: "image/jpeg",
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        id: "test-id-123",
        status: "completed",
        qr_code: "ELI-2024-ABC123",
        qr_code_valid: true,
        quality: "good",
        processed_at: "2024-01-01T00:00:00.000Z",
      });

      expect(mockImageProcessor.validateImageFile).toHaveBeenCalled();
      expect(mockImageProcessor.processImage).toHaveBeenCalled();
      expect(mockTestStripModel.create).toHaveBeenCalledWith({
        qr_code: "ELI-2024-ABC123",
        original_image_path: expect.any(String),
        thumbnail_path: "thumb_test.jpg",
        image_size: 1024000,
        image_dimensions: "1920x1080",
        status: "completed",
        error_message: undefined,
      });
    });

    it("should handle image without QR code", async () => {
      const testImageBuffer = createTestImageBuffer();

      mockImageProcessor.validateImageFile.mockReturnValue({ isValid: true });
      mockImageProcessor.processImage.mockResolvedValue(
        createMockImageProcessingResult({
          qrCode: undefined,
          quality: "poor",
        })
      );

      mockTestStripModel.create.mockResolvedValue({
        id: "test-id-456",
        qr_code: undefined,
        original_image_path: "test-image.jpg",
        thumbnail_path: "thumb_test.jpg",
        image_size: 1024000,
        image_dimensions: "1920x1080",
        status: "qr_not_found",
        error_message: undefined,
        created_at: new Date("2024-01-01T00:00:00Z"),
      });

      const response = await request(app)
        .post("/api/test-strips/upload")
        .attach("image", testImageBuffer, {
          filename: "test-image.jpg",
          contentType: "image/jpeg",
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        id: "test-id-456",
        status: "qr_not_found",
        qr_code: undefined,
        qr_code_valid: undefined,
        quality: "poor",
        processed_at: "2024-01-01T00:00:00.000Z",
      });

      expect(mockTestStripModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "qr_not_found",
          qr_code: undefined,
        })
      );
    });

    it("should handle invalid QR code", async () => {
      const testImageBuffer = createTestImageBuffer();

      mockImageProcessor.validateImageFile.mockReturnValue({ isValid: true });
      mockImageProcessor.processImage.mockResolvedValue(
        createMockImageProcessingResult({
          qrCode: {
            data: "INVALID-QR-CODE",
            isValid: false,
            isExpired: false,
          },
          quality: "poor",
        })
      );

      mockTestStripModel.create.mockResolvedValue({
        id: "test-id-789",
        qr_code: "INVALID-QR-CODE",
        original_image_path: "test-image.jpg",
        thumbnail_path: "thumb_test.jpg",
        image_size: 1024000,
        image_dimensions: "1920x1080",
        status: "qr_invalid",
        error_message: undefined,
        created_at: new Date("2024-01-01T00:00:00Z"),
      });

      const response = await request(app)
        .post("/api/test-strips/upload")
        .attach("image", testImageBuffer, {
          filename: "test-image.jpg",
          contentType: "image/jpeg",
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        id: "test-id-789",
        status: "qr_invalid",
        qr_code: "INVALID-QR-CODE",
        qr_code_valid: false,
        quality: "poor",
        processed_at: "2024-01-01T00:00:00.000Z",
      });
    });

    it("should handle expired QR code", async () => {
      const testImageBuffer = createTestImageBuffer();

      mockImageProcessor.validateImageFile.mockReturnValue({ isValid: true });
      mockImageProcessor.processImage.mockResolvedValue(
        createMockImageProcessingResult({
          qrCode: {
            data: "ELI-2020-OLD123",
            isValid: true,
            isExpired: true,
          },
          quality: "poor",
        })
      );

      mockTestStripModel.create.mockResolvedValue({
        id: "test-id-expired",
        qr_code: "ELI-2020-OLD123",
        original_image_path: "test-image.jpg",
        thumbnail_path: "thumb_test.jpg",
        image_size: 1024000,
        image_dimensions: "1920x1080",
        status: "qr_expired",
        error_message: undefined,
        created_at: new Date("2024-01-01T00:00:00Z"),
      });

      const response = await request(app)
        .post("/api/test-strips/upload")
        .attach("image", testImageBuffer, {
          filename: "test-image.jpg",
          contentType: "image/jpeg",
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe("qr_expired");
    });

    it("should reject invalid file type", async () => {
      const testImageBuffer = createTestImageBuffer();

      mockImageProcessor.validateImageFile.mockReturnValue({
        isValid: false,
        error: "Invalid file type. Only JPG and PNG files are allowed.",
      });

      const response = await request(app)
        .post("/api/test-strips/upload")
        .attach("image", testImageBuffer, {
          filename: "test-image.gif",
          contentType: "image/gif",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: "Invalid file type. Only JPG and PNG files are allowed.",
      });

      expect(mockImageProcessor.processImage).not.toHaveBeenCalled();
      expect(mockTestStripModel.create).not.toHaveBeenCalled();
    });

    it("should handle missing image file", async () => {
      const response = await request(app)
        .post("/api/test-strips/upload")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: "No image file provided",
      });
    });

    it("should handle processing errors", async () => {
      const testImageBuffer = createTestImageBuffer();

      mockImageProcessor.validateImageFile.mockReturnValue({ isValid: true });
      mockImageProcessor.processImage.mockResolvedValue(
        createMockImageProcessingResult({
          quality: "failed",
        })
      );

      mockTestStripModel.create.mockResolvedValue({
        id: "test-id-failed",
        qr_code: undefined,
        original_image_path: "test-image.jpg",
        thumbnail_path: undefined,
        image_size: 0,
        image_dimensions: "unknown",
        status: "failed",
        error_message: "Image processing failed",
        created_at: new Date("2024-01-01T00:00:00Z"),
      });

      const response = await request(app)
        .post("/api/test-strips/upload")
        .attach("image", testImageBuffer, {
          filename: "test-image.jpg",
          contentType: "image/jpeg",
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe("failed");
      expect(response.body.quality).toBe("failed");
    });

    it("should handle database errors", async () => {
      const testImageBuffer = createTestImageBuffer();

      mockImageProcessor.validateImageFile.mockReturnValue({ isValid: true });
      mockImageProcessor.processImage.mockResolvedValue(
        createMockImageProcessingResult()
      );
      mockTestStripModel.create.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/test-strips/upload")
        .attach("image", testImageBuffer, {
          filename: "test-image.jpg",
          contentType: "image/jpeg",
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: "Internal server error during image processing",
        details: expect.any(Object),
      });
    });
  });

  describe("GET /api/test-strips", () => {
    it("should return paginated list of submissions", async () => {
      const mockSubmissions = {
        data: [
          {
            id: "test-1",
            qr_code: "ELI-2024-ABC123",
            status: "completed" as SubmissionStatus,
            quality: "good" as const,
            thumbnail_url: "/uploads/thumb_1.jpg",
            created_at: new Date("2024-01-01T00:00:00Z"),
          },
          {
            id: "test-2",
            qr_code: undefined,
            status: "qr_not_found" as SubmissionStatus,
            quality: "poor" as const,
            thumbnail_url: undefined,
            created_at: new Date("2024-01-02T00:00:00Z"),
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 25,
          total_pages: 2,
        },
      };

      mockTestStripModel.findAll.mockResolvedValue(mockSubmissions);

      const response = await request(app).get("/api/test-strips");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        data: [
          {
            id: "test-1",
            qr_code: "ELI-2024-ABC123",
            status: "completed",
            quality: "good",
            thumbnail_url: "/uploads/thumb_1.jpg",
            created_at: "2024-01-01T00:00:00.000Z",
          },
          {
            id: "test-2",
            status: "qr_not_found",
            quality: "poor",
            created_at: "2024-01-02T00:00:00.000Z",
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 25,
          total_pages: 2,
        },
      });
      expect(mockTestStripModel.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        offset: 0,
      });
    });

    it("should handle custom pagination parameters", async () => {
      const mockSubmissions = {
        data: [],
        pagination: {
          page: 3,
          limit: 5,
          total: 12,
          total_pages: 3,
        },
      };

      mockTestStripModel.findAll.mockResolvedValue(mockSubmissions);

      const response = await request(app)
        .get("/api/test-strips")
        .query({ page: "3", limit: "5" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSubmissions);
      expect(mockTestStripModel.findAll).toHaveBeenCalledWith({
        page: 3,
        limit: 5,
        offset: 10,
      });
    });

    it("should limit maximum items per page", async () => {
      const mockSubmissions = {
        data: [],
        pagination: {
          page: 1,
          limit: 100,
          total: 150,
          total_pages: 2,
        },
      };

      mockTestStripModel.findAll.mockResolvedValue(mockSubmissions);

      const response = await request(app)
        .get("/api/test-strips")
        .query({ limit: "200" }); // Request more than max

      expect(response.status).toBe(200);
      expect(mockTestStripModel.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 100, // Should be capped at 100
        offset: 0,
      });
    });

    it("should handle database errors", async () => {
      mockTestStripModel.findAll.mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/test-strips");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: "Failed to fetch test strips",
        details: expect.any(Object),
      });
    });
  });

  describe("GET /api/test-strips/:id", () => {
    it("should return submission details by ID", async () => {
      const testId = "12345678-1234-4123-a123-123456789012";
      const mockSubmission = {
        id: testId,
        qr_code: "ELI-2024-ABC123",
        original_image_path: "original.jpg",
        thumbnail_path: "thumb.jpg",
        image_size: 1024000,
        image_dimensions: "1920x1080",
        status: "completed" as SubmissionStatus,
        error_message: undefined,
        created_at: new Date("2024-01-01T00:00:00Z"),
      };

      mockTestStripModel.findById.mockResolvedValue(mockSubmission);

      const response = await request(app).get(`/api/test-strips/${testId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: testId,
        qr_code: "ELI-2024-ABC123",
        original_image_path: "original.jpg",
        thumbnail_path: "thumb.jpg",
        image_size: 1024000,
        image_dimensions: "1920x1080",
        status: "completed",
        created_at: "2024-01-01T00:00:00.000Z",
        originalImageUrl: "/uploads/original.jpg",
        thumbnailUrl: "/uploads/thumb.jpg",
        quality: "good",
      });
      expect(mockTestStripModel.findById).toHaveBeenCalledWith(testId);
    });

    it("should return 404 for non-existent submission", async () => {
      const testId = "12345678-1234-4123-a123-123456789999";

      mockTestStripModel.findById.mockResolvedValue(null);

      const response = await request(app).get(`/api/test-strips/${testId}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: "Test strip submission not found",
      });
    });

    it("should validate UUID format", async () => {
      const invalidId = "invalid-uuid";

      const response = await request(app).get(`/api/test-strips/${invalidId}`);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: "Invalid ID format",
      });
      expect(mockTestStripModel.findById).not.toHaveBeenCalled();
    });

    it("should map quality correctly based on status", async () => {
      const testCases = [
        { status: "completed", expectedQuality: "good" },
        { status: "qr_not_found", expectedQuality: "poor" },
        { status: "qr_invalid", expectedQuality: "poor" },
        { status: "qr_expired", expectedQuality: "poor" },
        { status: "failed", expectedQuality: "failed" },
      ];

      for (const { status, expectedQuality } of testCases) {
        const testId = `12345678-1234-4123-a123-123456789012`;
        const mockSubmission = {
          id: testId,
          qr_code: "ELI-2024-ABC123",
          original_image_path: "original.jpg",
          thumbnail_path: "thumb.jpg",
          image_size: 1024000,
          image_dimensions: "1920x1080",
          status: status as any,
          error_message: undefined,
          created_at: new Date("2024-01-01T00:00:00Z"),
        };

        mockTestStripModel.findById.mockResolvedValue(mockSubmission);

        const response = await request(app).get(`/api/test-strips/${testId}`);

        expect(response.status).toBe(200);
        expect(response.body.quality).toBe(expectedQuality);
      }
    });

    it("should handle database errors", async () => {
      const testId = "12345678-1234-4123-a123-123456789012";

      mockTestStripModel.findById.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).get(`/api/test-strips/${testId}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: "Failed to fetch test strip",
        details: expect.any(Object),
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle 404 for unknown routes", async () => {
      const response = await request(app).get(
        "/api/test-strips/nonexistent-endpoint/extra"
      );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: "Route not found",
        message: "Cannot GET /api/test-strips/nonexistent-endpoint/extra",
      });
    });

    it("should handle malformed JSON in request body", async () => {
      const response = await request(app)
        .post("/api/test-strips/upload")
        .set("Content-Type", "application/json")
        .send("{ malformed json }");

      expect(response.status).toBe(400);
    });
  });
});
