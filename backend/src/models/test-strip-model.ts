import { pool } from "../database";
import {
  TestStripSubmission,
  PaginationParams,
  PaginatedResponse,
} from "../types";

export async function createTestStrip(
  data: Omit<TestStripSubmission, "id" | "created_at">
): Promise<TestStripSubmission> {
  const query = `
    INSERT INTO test_strip_submissions
    (qr_code, original_image_path, thumbnail_path, image_size, image_dimensions, status, error_message)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;

  const values = [
    data.qr_code,
    data.original_image_path,
    data.thumbnail_path,
    data.image_size,
    data.image_dimensions,
    data.status,
    data.error_message,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function findTestStripById(
  id: string
): Promise<TestStripSubmission | null> {
  const query = "SELECT * FROM test_strip_submissions WHERE id = $1";
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

export async function findAllTestStrips(
  pagination: PaginationParams
): Promise<PaginatedResponse<TestStripSubmission>> {
  const countQuery = "SELECT COUNT(*) FROM test_strip_submissions";
  const countResult = await pool.query(countQuery);
  const total = parseInt(countResult.rows[0].count);

  const query = `
    SELECT
      id,
      qr_code,
      status,
      error_message,
      thumbnail_path,
      created_at
    FROM test_strip_submissions
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `;

  const result = await pool.query(query, [pagination.limit, pagination.offset]);

  return {
    data: result.rows,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      total_pages: Math.ceil(total / pagination.limit),
    },
  };
}
