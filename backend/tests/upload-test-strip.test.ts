import path from 'path';
import express from 'express';
import request from 'supertest';
import { TestStripSubmission } from '../src/types';
import testStripRoutes from '../src/routes/test-strip-routes';

jest.mock('../src/database', () => ({
  pool: {
    query: jest.fn(),
  },
  testConnection: jest.fn(),
}));

jest.mock('../src/models/test-strip-model', () => ({
  createTestStrip: jest.fn(),
}));

jest.mock('../src/utils/image-processor', () => ({
  processImage: jest.fn(),
}));

function createTestApp() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    '/uploads',
    express.static(path.join(process.cwd(), '..', 'uploads')),
  );

  app.use('/api/test-strips', testStripRoutes);

  return app;
}

describe('POST /api/test-strips/upload - Upload Test Strip API Flow', () => {
  let app: express.Application;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully upload a valid test strip image and return complete response', async () => {
    const { processImage } = require('../src/utils/image-processor');
    const { createTestStrip } = require('../src/models/test-strip-model');

    processImage.mockResolvedValue({
      qrCode: {
        qrCode: 'ELI-2025-001',
        status: 'valid',
        error: null,
      },
      thumbnailPath: 'thumb_test-strip-valid-1.jpg',
      imageSize: 1024768,
      imageDimensions: { width: 1024, height: 768 },
    });

    const mockSubmission = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      qr_code: 'ELI-2025-001',
      original_image_path: 'generated-filename.png',
      thumbnail_path: 'thumb_test-strip-valid-1.jpg',
      image_size: 1024768,
      image_dimensions: { width: 1024, height: 768 },
      status: 'valid',
      error_message: null,
      created_at: new Date().toISOString(),
    };

    createTestStrip.mockImplementation((data: TestStripSubmission) => {
      return Promise.resolve({
        ...mockSubmission,
        original_image_path: data.original_image_path,
      });
    });

    const testImagePath = path.resolve(
      __dirname,
      './files/test-strip-valid-1.png',
    );

    const response = await request(app)
      .post('/api/test-strips/upload')
      .attach('image', testImagePath)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('qr_code', 'ELI-2025-001');
    expect(response.body).toHaveProperty('original_image_path');
    expect(response.body).toHaveProperty('thumbnail_path');
    expect(response.body).toHaveProperty('image_size');
    expect(response.body).toHaveProperty('image_dimensions');
    expect(response.body).toHaveProperty('status', 'valid');
    expect(response.body).toHaveProperty('error_message', null);
    expect(response.body).toHaveProperty('created_at');

    expect(response.body.image_size).toBeGreaterThan(0);
    expect(response.body.image_dimensions).toHaveProperty('width');
    expect(response.body.image_dimensions).toHaveProperty('height');
    expect(response.body.image_dimensions.width).toBeGreaterThan(0);
    expect(response.body.image_dimensions.height).toBeGreaterThan(0);

    expect(new Date(response.body.created_at)).toBeInstanceOf(Date);
    expect(new Date(response.body.created_at).getTime()).toBeLessThanOrEqual(
      Date.now(),
    );

    expect(processImage).toHaveBeenCalledWith(expect.stringContaining('.png'));
    expect(createTestStrip).toHaveBeenCalledWith({
      qr_code: 'ELI-2025-001',
      original_image_path: expect.stringMatching(/\.png$/),
      thumbnail_path: 'thumb_test-strip-valid-1.jpg',
      image_size: 1024768,
      image_dimensions: { width: 1024, height: 768 },
      status: 'valid',
      error_message: null,
    });
  });
});
