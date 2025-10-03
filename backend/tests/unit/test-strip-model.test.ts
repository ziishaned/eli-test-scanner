import { TestStripModel } from "../../src/models/test-strip-model";
import {
  createMockPool,
  createTestSubmission,
  setupTestEnv,
} from "../test-helpers";
import { SubmissionStatus } from "../../src/types";

// Mock the database module
jest.mock("../../src/database", () => ({
  pool: {},
}));

describe("TestStripModel", () => {
  let mockDatabase: ReturnType<typeof createMockPool>;

  beforeEach(() => {
    setupTestEnv();
    mockDatabase = createMockPool();

    // Replace the pool with our mock
    const database = require("../../src/database");
    database.pool = mockDatabase.mockPool;
  });

  describe("create", () => {
    it("should create a new test strip submission", async () => {
      const submissionData = {
        qr_code: "ELI-2024-ABC123",
        original_image_path: "test-image.jpg",
        thumbnail_path: "thumb_test-image.jpg",
        image_size: 1024000,
        image_dimensions: "1920x1080",
        status: "completed" as SubmissionStatus,
        error_message: undefined,
      };

      const expectedSubmission = createTestSubmission(submissionData);

      mockDatabase.mockQuery.mockResolvedValue({
        rows: [expectedSubmission],
      });

      const result = await TestStripModel.create(submissionData);

      expect(result).toEqual(expectedSubmission);
      expect(mockDatabase.mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO test_strip_submissions"),
        [
          "ELI-2024-ABC123",
          "test-image.jpg",
          "thumb_test-image.jpg",
          1024000,
          "1920x1080",
          "completed",
          undefined,
        ]
      );
    });

    it("should create submission without QR code", async () => {
      const submissionData = {
        qr_code: undefined,
        original_image_path: "test-image.jpg",
        thumbnail_path: undefined,
        image_size: 512000,
        image_dimensions: "800x600",
        status: "qr_not_found" as SubmissionStatus,
        error_message: "No QR code found",
      };

      const expectedSubmission = createTestSubmission(submissionData);

      mockDatabase.mockQuery.mockResolvedValue({
        rows: [expectedSubmission],
      });

      const result = await TestStripModel.create(submissionData);

      expect(result).toEqual(expectedSubmission);
      expect(mockDatabase.mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO test_strip_submissions"),
        [
          undefined,
          "test-image.jpg",
          undefined,
          512000,
          "800x600",
          "qr_not_found",
          "No QR code found",
        ]
      );
    });

    it("should handle database errors during creation", async () => {
      const submissionData = {
        qr_code: "ELI-2024-ABC123",
        original_image_path: "test-image.jpg",
        thumbnail_path: "thumb_test-image.jpg",
        image_size: 1024000,
        image_dimensions: "1920x1080",
        status: "completed" as SubmissionStatus,
      };

      mockDatabase.mockQuery.mockRejectedValue(
        new Error("Database connection failed")
      );

      await expect(TestStripModel.create(submissionData)).rejects.toThrow(
        "Database connection failed"
      );
    });
  });

  describe("findById", () => {
    it("should find submission by ID", async () => {
      const testId = "test-id-123";
      const expectedSubmission = createTestSubmission({ id: testId });

      mockDatabase.mockQuery.mockResolvedValue({
        rows: [expectedSubmission],
      });

      const result = await TestStripModel.findById(testId);

      expect(result).toEqual(expectedSubmission);
      expect(mockDatabase.mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM test_strip_submissions WHERE id = $1",
        [testId]
      );
    });

    it("should return null for non-existent ID", async () => {
      const testId = "non-existent-id";

      mockDatabase.mockQuery.mockResolvedValue({
        rows: [],
      });

      const result = await TestStripModel.findById(testId);

      expect(result).toBeNull();
      expect(mockDatabase.mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM test_strip_submissions WHERE id = $1",
        [testId]
      );
    });

    it("should handle database errors during find", async () => {
      const testId = "test-id-123";

      mockDatabase.mockQuery.mockRejectedValue(
        new Error("Database query failed")
      );

      await expect(TestStripModel.findById(testId)).rejects.toThrow(
        "Database query failed"
      );
    });
  });

  describe("findAll", () => {
    it("should return paginated submissions", async () => {
      const pagination = { page: 1, limit: 10, offset: 0 };

      // Mock count query
      mockDatabase.mockQuery
        .mockResolvedValueOnce({ rows: [{ count: "25" }] })
        .mockResolvedValueOnce({
          rows: [
            {
              id: "test-1",
              qr_code: "ELI-2024-ABC123",
              status: "completed",
              thumbnail_path: "thumb_1.jpg",
              created_at: new Date("2024-01-01"),
              quality: "good",
            },
            {
              id: "test-2",
              qr_code: null,
              status: "qr_not_found",
              thumbnail_path: null,
              created_at: new Date("2024-01-02"),
              quality: "poor",
            },
          ],
        });

      const result = await TestStripModel.findAll(pagination);

      expect(result).toEqual({
        data: [
          {
            id: "test-1",
            qr_code: "ELI-2024-ABC123",
            status: "completed",
            quality: "good",
            thumbnail_url: "/uploads/thumb_1.jpg",
            created_at: new Date("2024-01-01"),
          },
          {
            id: "test-2",
            qr_code: null,
            status: "qr_not_found",
            quality: "poor",
            thumbnail_url: undefined,
            created_at: new Date("2024-01-02"),
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          total_pages: 3,
        },
      });

      expect(mockDatabase.mockQuery).toHaveBeenCalledTimes(2);
      expect(mockDatabase.mockQuery).toHaveBeenNthCalledWith(
        1,
        "SELECT COUNT(*) FROM test_strip_submissions"
      );
      expect(mockDatabase.mockQuery).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("SELECT"),
        [10, 0]
      );
    });

    it("should handle different pagination parameters", async () => {
      const pagination = { page: 3, limit: 5, offset: 10 };

      mockDatabase.mockQuery
        .mockResolvedValueOnce({ rows: [{ count: "15" }] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await TestStripModel.findAll(pagination);

      expect(result.pagination).toEqual({
        page: 3,
        limit: 5,
        total: 15,
        total_pages: 3,
      });

      expect(mockDatabase.mockQuery).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("LIMIT $1 OFFSET $2"),
        [5, 10]
      );
    });

    it("should map quality based on status correctly", async () => {
      const pagination = { page: 1, limit: 10, offset: 0 };

      mockDatabase.mockQuery
        .mockResolvedValueOnce({ rows: [{ count: "4" }] })
        .mockResolvedValueOnce({
          rows: [
            { id: "1", status: "completed", quality: "good" },
            { id: "2", status: "qr_not_found", quality: "poor" },
            { id: "3", status: "qr_invalid", quality: "poor" },
            { id: "4", status: "failed", quality: "failed" },
          ],
        });

      const result = await TestStripModel.findAll(pagination);

      expect(
        result.data.map((item) => ({ id: item.id, quality: item.quality }))
      ).toEqual([
        { id: "1", quality: "good" },
        { id: "2", quality: "poor" },
        { id: "3", quality: "poor" },
        { id: "4", quality: "failed" },
      ]);
    });

    it("should handle database errors during findAll", async () => {
      const pagination = { page: 1, limit: 10, offset: 0 };

      mockDatabase.mockQuery.mockRejectedValue(
        new Error("Database query failed")
      );

      await expect(TestStripModel.findAll(pagination)).rejects.toThrow(
        "Database query failed"
      );
    });
  });

  describe("update", () => {
    it("should update a submission", async () => {
      const testId = "test-id-123";
      const updateData = {
        status: "completed" as SubmissionStatus,
        qr_code: "ELI-2024-NEW123",
      };

      const updatedSubmission = createTestSubmission({
        ...updateData,
        id: testId,
      });

      mockDatabase.mockQuery.mockResolvedValue({
        rows: [updatedSubmission],
      });

      const result = await TestStripModel.update(testId, updateData);

      expect(result).toEqual(updatedSubmission);
      expect(mockDatabase.mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE test_strip_submissions"),
        [testId, "completed", "ELI-2024-NEW123"]
      );
    });

    it("should return null for non-existent submission", async () => {
      const testId = "non-existent-id";
      const updateData = { status: "completed" as SubmissionStatus };

      mockDatabase.mockQuery.mockResolvedValue({
        rows: [],
      });

      const result = await TestStripModel.update(testId, updateData);

      expect(result).toBeNull();
    });

    it("should filter out protected fields from updates", async () => {
      const testId = "test-id-123";
      const updateData = {
        id: "should-be-ignored",
        created_at: new Date(),
        status: "completed" as SubmissionStatus,
        qr_code: "ELI-2024-NEW123",
      } as any;

      const updatedSubmission = createTestSubmission({
        status: "completed",
        qr_code: "ELI-2024-NEW123",
        id: testId,
      });

      mockDatabase.mockQuery.mockResolvedValue({
        rows: [updatedSubmission],
      });

      const result = await TestStripModel.update(testId, updateData);

      expect(result).toEqual(updatedSubmission);

      // Verify that id and created_at are not in the SQL query
      const [query, params] = mockDatabase.mockQuery.mock.calls[0];
      expect(query).toContain("status = $2");
      expect(query).toContain("qr_code = $3");
      expect(params).toEqual([testId, "completed", "ELI-2024-NEW123"]);
    });

    it("should handle single field updates", async () => {
      const testId = "test-id-123";
      const updateData = { status: "failed" as SubmissionStatus };

      const updatedSubmission = createTestSubmission({
        status: "failed",
        id: testId,
      });

      mockDatabase.mockQuery.mockResolvedValue({
        rows: [updatedSubmission],
      });

      const result = await TestStripModel.update(testId, updateData);

      expect(result).toEqual(updatedSubmission);
      expect(mockDatabase.mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("status = $2"),
        [testId, "failed"]
      );
    });

    it("should handle database errors during update", async () => {
      const testId = "test-id-123";
      const updateData = { status: "completed" as SubmissionStatus };

      mockDatabase.mockQuery.mockRejectedValue(new Error("Update failed"));

      await expect(TestStripModel.update(testId, updateData)).rejects.toThrow(
        "Update failed"
      );
    });
  });
});
