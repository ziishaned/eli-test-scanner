import { Pool } from "pg";
import { TestStripSubmission } from "../src/types";

// Mock database pool for testing
export const createMockPool = () => {
  const mockQuery = jest.fn();
  const mockConnect = jest.fn();
  const mockRelease = jest.fn();

  const mockClient = {
    query: mockQuery,
    release: mockRelease,
  };

  const mockPool = {
    query: mockQuery,
    connect: jest.fn().mockResolvedValue(mockClient),
    end: jest.fn(),
  } as unknown as jest.Mocked<Pool>;

  return {
    mockPool,
    mockQuery,
    mockConnect,
    mockRelease,
    mockClient,
  };
};

// Test data factory
export const createTestSubmission = (
  overrides: Partial<TestStripSubmission> = {}
): TestStripSubmission => ({
  id: "test-id-123",
  qr_code: "ELI-2024-ABC123",
  original_image_path: "test-image.jpg",
  thumbnail_path: "thumb_test-image.jpg",
  image_size: 1024000,
  image_dimensions: "1920x1080",
  status: "completed",
  error_message: undefined,
  created_at: new Date("2024-01-01T00:00:00Z"),
  ...overrides,
});

// Mock Express.Multer.File
export const createMockFile = (
  overrides: Partial<Express.Multer.File> = {}
): Express.Multer.File => ({
  fieldname: "image",
  originalname: "test-image.jpg",
  encoding: "7bit",
  mimetype: "image/jpeg",
  size: 1024000,
  destination: "../uploads",
  filename: "test-123.jpg",
  path: "/uploads/test-123.jpg",
  buffer: Buffer.from("fake-image-data"),
  stream: null as any,
  ...overrides,
});

// Mock image processing results
export const createMockImageProcessingResult = (overrides = {}) => ({
  thumbnailPath: "thumb_test.jpg",
  imageDimensions: "1920x1080",
  imageSize: 1024000,
  qrCode: {
    data: "ELI-2024-ABC123",
    isValid: true,
    isExpired: false,
  },
  quality: "good" as const,
  ...overrides,
});

// Helper to create test files
export const createTestImageBuffer = (): Buffer => {
  // Create a minimal test image buffer (1x1 pixel PNG)
  return Buffer.from([
    0x89,
    0x50,
    0x4e,
    0x47,
    0x0d,
    0x0a,
    0x1a,
    0x0a, // PNG signature
    0x00,
    0x00,
    0x00,
    0x0d,
    0x49,
    0x48,
    0x44,
    0x52, // IHDR chunk
    0x00,
    0x00,
    0x00,
    0x01,
    0x00,
    0x00,
    0x00,
    0x01, // 1x1 dimensions
    0x08,
    0x02,
    0x00,
    0x00,
    0x00,
    0x90,
    0x77,
    0x53, // bit depth, color type, etc.
    0xde,
    0x00,
    0x00,
    0x00,
    0x0c,
    0x49,
    0x44,
    0x41, // IDAT chunk
    0x54,
    0x08,
    0x99,
    0x01,
    0x01,
    0x00,
    0x00,
    0x00, // image data
    0xff,
    0xff,
    0x00,
    0x00,
    0x00,
    0x02,
    0x00,
    0x01, // image data
    0xe2,
    0x21,
    0xbc,
    0x33,
    0x00,
    0x00,
    0x00,
    0x00, // IEND chunk
    0x49,
    0x45,
    0x4e,
    0x44,
    0xae,
    0x42,
    0x60,
    0x82,
  ]);
};

// Mock environment variables for tests
export const setupTestEnv = () => {
  process.env.NODE_ENV = "test";
  process.env.DB_USER = "test_user";
  process.env.DB_HOST = "localhost";
  process.env.DB_NAME = "test_db";
  process.env.DB_PASSWORD = "test_password";
  process.env.DB_PORT = "5432";
};
