# Backend Tests

This directory contains comprehensive tests for the backend API, including unit tests, integration tests, and test utilities.

## Test Structure

```
tests/
├── setup.ts                 # Global test setup and configuration
├── test-helpers.ts          # Utility functions and mocks
├── fixtures/                # Test data and sample files
│   └── test-data.ts         # Sample submissions and test scenarios
├── unit/                    # Unit tests for individual components
│   ├── image-processor.test.ts  # ImageProcessor class tests
│   └── test-strip-model.test.ts # TestStripModel database tests
└── integration/             # Integration tests for API endpoints
    └── api.test.ts          # Full API endpoint tests
```

## Running Tests

### Prerequisites

Make sure you have installed all dependencies:

```bash
npm install
```

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests in CI mode (single run, no watch)
npm run test:ci
```

### Test Coverage

The tests aim for comprehensive coverage of:

- **ImageProcessor** (Unit Tests)

  - File validation (type, size limits)
  - QR code extraction and validation
  - Thumbnail generation
  - Quality determination
  - Error handling

- **TestStripModel** (Unit Tests)

  - Database CRUD operations
  - Pagination logic
  - Data transformation
  - Error handling

- **API Endpoints** (Integration Tests)
  - File upload and processing
  - Pagination and filtering
  - Error responses
  - Input validation

## Test Environment

Tests run in an isolated environment with:

- Mocked database connections
- Mocked file system operations
- Mocked external libraries (Sharp, jsQR)
- Sample test data and fixtures

## Key Testing Patterns

### Mocking Strategy

```typescript
// Database mocking
jest.mock("../../src/database", () => ({
  pool: mockPool,
}));

// External library mocking
jest.mock("sharp");
jest.mock("jsqr");
```

### Test Data Factories

```typescript
// Create test submissions
const submission = createTestSubmission({
  status: "completed",
  qr_code: "ELI-2024-ABC123",
});

// Create mock file uploads
const file = createMockFile({
  mimetype: "image/jpeg",
  size: 1024000,
});
```

### API Testing

```typescript
// Test API endpoints with supertest
const response = await request(app)
  .post("/api/test-strips/upload")
  .attach("image", testImageBuffer, {
    filename: "test.jpg",
    contentType: "image/jpeg",
  });

expect(response.status).toBe(201);
expect(response.body).toEqual(expectedResponse);
```

## Test Scenarios Covered

### Image Processing Tests

1. **Valid Images**

   - JPEG and PNG format validation
   - Successful QR code extraction
   - Thumbnail generation
   - Quality assessment

2. **Invalid Images**

   - Unsupported file formats
   - Files exceeding size limits
   - Corrupted images
   - Images without QR codes

3. **QR Code Validation**
   - Valid ELI format codes
   - Invalid format codes
   - Expired codes (old years)
   - Missing QR codes

### Database Tests

1. **CRUD Operations**

   - Creating new submissions
   - Finding by ID
   - Paginated listings
   - Updating records

2. **Data Integrity**
   - Field validation
   - Type safety
   - Error handling

### API Integration Tests

1. **Upload Endpoint**

   - Successful uploads
   - File validation errors
   - Processing failures
   - Database errors

2. **List Endpoint**

   - Pagination parameters
   - Data transformation
   - Error responses

3. **Detail Endpoint**
   - ID validation
   - Data enrichment
   - 404 handling

## Debugging Tests

### Common Issues

1. **Mock not working**: Ensure mocks are set up before imports
2. **Async test failures**: Use proper async/await patterns
3. **Type errors**: Ensure test data matches TypeScript interfaces

### Debug Commands

```bash
# Run a specific test file
npm test -- image-processor.test.ts

# Run tests with verbose output
npm test -- --verbose

# Run a specific test case
npm test -- --testNamePattern="should validate QR code"
```

### Test Environment Variables

Tests automatically set up a test environment with:

```bash
NODE_ENV=test
DB_USER=test_user
DB_HOST=localhost
DB_NAME=test_db
DB_PASSWORD=test_password
DB_PORT=5432
```

## Writing New Tests

### Unit Test Template

```typescript
import { YourClass } from "../../src/path/to/class";
import { setupTestEnv } from "../test-helpers";

describe("YourClass", () => {
  beforeEach(() => {
    setupTestEnv();
    jest.clearAllMocks();
  });

  describe("methodName", () => {
    it("should handle success case", async () => {
      // Arrange
      const input = {
        /* test data */
      };

      // Act
      const result = await YourClass.methodName(input);

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it("should handle error case", async () => {
      // Test error scenarios
    });
  });
});
```

### Integration Test Template

```typescript
import request from "supertest";
import { createTestApp } from "../test-helpers";

describe("API Integration", () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
    // Set up mocks
  });

  it("should handle API request", async () => {
    const response = await request(app).post("/api/endpoint").send(testData);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expectedResponse);
  });
});
```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Clear Naming**: Test names should describe the scenario
3. **AAA Pattern**: Arrange, Act, Assert structure
4. **Edge Cases**: Test both success and failure paths
5. **Mock Properly**: Mock external dependencies consistently
6. **Clean Up**: Reset mocks between tests

## Continuous Integration

Tests are designed to run in CI environments with:

- No external dependencies
- Deterministic results
- Fast execution
- Clear failure messages

The `npm run test:ci` command is optimized for CI/CD pipelines.
