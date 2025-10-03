import { Pool } from "pg";
import { promises as fs } from "fs";
import path from "path";

// Test setup configuration
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = "test";

  // Increase timeout for database operations
  jest.setTimeout(30000);
});

beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
});

afterAll(async () => {
  // Clean up after all tests
  await new Promise((resolve) => setTimeout(resolve, 100));
});
