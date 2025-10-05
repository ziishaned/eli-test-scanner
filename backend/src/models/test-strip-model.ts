import { pool } from '../database';
import {
  TestStripSubmission,
  PaginationParams,
  PaginatedResponse,
} from '../types';
import { logger } from '../utils/logger';
import { ApplicationError } from '../errors/application-error';

export async function createTestStrip(
  data: Omit<TestStripSubmission, 'id' | 'created_at'>
): Promise<TestStripSubmission> {
  const client = await pool.connect();
  try {
    const result = await client.query({
      name: 'create-test-strip',
      text: `
      INSERT INTO
        test_strip_submissions (
          qr_code,
          original_image_path,
          thumbnail_path,
          image_size,
          image_dimensions,
          status,
          error_message
        )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7
      )
      RETURNING
        *
    `,
      values: [
        data.qr_code,
        data.original_image_path,
        data.thumbnail_path,
        data.image_size,
        data.image_dimensions,
        data.status,
        data.error_message,
      ],
    });
    return result.rows[0];
  } catch (error) {
    logger.error(`Error creating test strip submission ${(error as Error)?.message}`);
    throw new ApplicationError('Failed to create test strip submission');
  } finally {
    client.release();
  }
}

export async function findTestStripById(
  id: string
): Promise<TestStripSubmission | null> {
  const client = await pool.connect();
  try {
    const result = await client.query({
      values: [id],
      name: 'fetch-test-strip-by-id',
      text: `
        SELECT
          *
        FROM
          test_strip_submissions
        WHERE
          id = $1
      `,
    });
    return result.rows[0] || null;
  } catch (error) {
    logger.error(`Error fetching test strip by id ${(error as Error)?.message}`);
    throw new ApplicationError('Failed to fetch test strip submission by id');
  } finally {
    client.release();
  }
}

export async function findAllTestStrips(
  pagination: PaginationParams
): Promise<PaginatedResponse<TestStripSubmission>> {
  const client = await pool.connect();
  try {
    const countResult = await client.query({
      name: 'count-test-strips',
      text: 'SELECT COUNT(*) FROM test_strip_submissions',
    });
    const total = parseInt(countResult.rows[0].count);

    const result = await client.query({
      name: 'fetch-test-strips',
      values: [pagination.limit, pagination.offset],
      text: `
        SELECT
          id,
          qr_code,
          status,
          error_message,
          thumbnail_path,
          created_at
        FROM
          test_strip_submissions
        ORDER BY
          created_at DESC
        LIMIT
          $1
        OFFSET
          $2
      `,
    });

    return {
      data: result.rows,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        total_pages: Math.ceil(total / pagination.limit),
      },
    };
  } catch (error) {
    logger.error(`Error while fetching test strip submissions ${(error as Error)?.message}`);
    throw new ApplicationError('Failed to fetch test strip submissions');
  } finally {
    client.release();
  }
}
