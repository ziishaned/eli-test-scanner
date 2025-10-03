import { pool } from "../database";
import {
  TestStripSubmission,
  SubmissionStatus,
  PaginationParams,
  PaginatedResponse,
  TestStripListItem,
} from "../types";

export const createTestStrip = async (data: {
  qr_code?: string;
  original_image_path: string;
  thumbnail_path?: string;
  image_size: number;
  image_dimensions: string;
  status?: SubmissionStatus;
  error_message?: string;
}): Promise<TestStripSubmission> => {
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
};

export const findTestStripById = async (
  id: string
): Promise<TestStripSubmission | null> => {
  const query = "SELECT * FROM test_strip_submissions WHERE id = $1";
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export const findAllTestStrips = async (
  pagination: PaginationParams
): Promise<PaginatedResponse<TestStripListItem>> => {
  const countQuery = "SELECT COUNT(*) FROM test_strip_submissions";
  const countResult = await pool.query(countQuery);
  const total = parseInt(countResult.rows[0].count);

  const query = `
    SELECT
      id,
      qr_code,
      status,
      thumbnail_path,
      created_at
    FROM test_strip_submissions
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `;

  const result = await pool.query(query, [pagination.limit, pagination.offset]);

  const data: TestStripListItem[] = result.rows.map((row) => ({
    id: row.id,
    qr_code: row.qr_code,
    status: row.status,
    thumbnail_url: row.thumbnail_path
      ? `/uploads/${row.thumbnail_path}`
      : undefined,
    created_at: row.created_at,
  }));

  return {
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      total_pages: Math.ceil(total / pagination.limit),
    },
  };
};
