import {
  SubmissionStatus,
  TestStripSubmission,
  TestStripListItem,
} from "../../src/types";

export const sampleSubmissions: TestStripSubmission[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    qr_code: "ELI-2024-ABC123",
    original_image_path: "sample1.jpg",
    thumbnail_path: "thumb_sample1.jpg",
    image_size: 1024000,
    image_dimensions: "1920x1080",
    status: "completed",
    error_message: undefined,
    created_at: new Date("2024-01-01T00:00:00Z"),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    qr_code: undefined,
    original_image_path: "sample2.jpg",
    thumbnail_path: "thumb_sample2.jpg",
    image_size: 512000,
    image_dimensions: "800x600",
    status: "qr_not_found",
    error_message: undefined,
    created_at: new Date("2024-01-02T00:00:00Z"),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    qr_code: "INVALID-QR-CODE",
    original_image_path: "sample3.jpg",
    thumbnail_path: "thumb_sample3.jpg",
    image_size: 768000,
    image_dimensions: "1280x720",
    status: "qr_invalid",
    error_message: undefined,
    created_at: new Date("2024-01-03T00:00:00Z"),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    qr_code: "ELI-2020-OLD123",
    original_image_path: "sample4.jpg",
    thumbnail_path: "thumb_sample4.jpg",
    image_size: 1536000,
    image_dimensions: "1920x1080",
    status: "qr_expired",
    error_message: undefined,
    created_at: new Date("2024-01-04T00:00:00Z"),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    qr_code: undefined,
    original_image_path: "sample5.jpg",
    thumbnail_path: undefined,
    image_size: 0,
    image_dimensions: "unknown",
    status: "failed",
    error_message: "Image processing failed",
    created_at: new Date("2024-01-05T00:00:00Z"),
  },
];

export const sampleListItems: TestStripListItem[] = sampleSubmissions.map(
  (submission) => ({
    id: submission.id,
    qr_code: submission.qr_code,
    status: submission.status,
    thumbnail_url: submission.thumbnail_path
      ? `/uploads/${submission.thumbnail_path}`
      : undefined,
    created_at: submission.created_at,
  })
);

export const validQRCodes = [
  "ELI-2024-ABC123",
  "ELI-2024-XYZ789",
  "ELI-2025-TEST01",
  "ELI-2024-VALID2",
];

export const invalidQRCodes = [
  "INVALID-FORMAT",
  "ELI-INVALID",
  "NOT-A-QR-CODE",
  "",
  "ELI-2020-EXPIRED", // Expired year
  "ELI-2019-OLD123", // Expired year
];

export const testImagePaths = {
  validJpeg: "tests/fixtures/test-image.jpg",
  validPng: "tests/fixtures/test-image.png",
  invalidGif: "tests/fixtures/test-image.gif",
  tooLarge: "tests/fixtures/large-image.jpg",
  corrupted: "tests/fixtures/corrupted.jpg",
};

// Helper to create test submissions with various scenarios
export const createTestScenarios = () => ({
  successful: {
    qr_code: "ELI-2024-ABC123",
    original_image_path: "test-success.jpg",
    thumbnail_path: "thumb_test-success.jpg",
    image_size: 1024000,
    image_dimensions: "1920x1080",
    status: "completed" as SubmissionStatus,
  },
  noQrCode: {
    qr_code: undefined,
    original_image_path: "test-no-qr.jpg",
    thumbnail_path: "thumb_test-no-qr.jpg",
    image_size: 512000,
    image_dimensions: "800x600",
    status: "qr_not_found" as SubmissionStatus,
  },
  invalidQr: {
    qr_code: "INVALID-QR",
    original_image_path: "test-invalid-qr.jpg",
    thumbnail_path: "thumb_test-invalid-qr.jpg",
    image_size: 768000,
    image_dimensions: "1280x720",
    status: "qr_invalid" as SubmissionStatus,
  },
  expiredQr: {
    qr_code: "ELI-2020-EXPIRED",
    original_image_path: "test-expired.jpg",
    thumbnail_path: "thumb_test-expired.jpg",
    image_size: 1024000,
    image_dimensions: "1920x1080",
    status: "qr_expired" as SubmissionStatus,
  },
  processingFailed: {
    qr_code: undefined,
    original_image_path: "test-failed.jpg",
    thumbnail_path: undefined,
    image_size: 0,
    image_dimensions: "unknown",
    status: "failed" as SubmissionStatus,
    error_message: "Image processing failed",
  },
});
