## Backend API (Node.js + TypeScript + PostgreSQL)

Endpoints:

```
POST /api/test-strips/upload
- Accepts: multipart/form-data with image file
- Validates image format (jpg, png)
- Processes image including QR code extraction (see processing requirements)
- Returns: { id, status, qrCode, qrCodeValid, quality, processedAt }

GET /api/test-strips
- Returns paginated list of submissions
- Includes: id, qrCode, status, quality, thumbnailUrl, createdAt

GET /api/test-strips/:id
- Returns detailed submission info
- Includes processed metadata
```

#### Image Processing Requirements: The backend must perform these operations:

1. QR Code Extraction - Extract and validate QR code data from the uploaded image
   - Detect QR code presence in the image
   - Extract QR code data if found
   - Validate QR code format (e.g., "ELI-YYYY-XXX")
   - Check expiration based on year in QR code
2. Thumbnail Generation - Create 200x200 thumbnail for list view
3. Basic Validation - Check image format, size, and basic metadata

### Database Schema:

```sql
CREATE TABLE test_strip_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_code VARCHAR(100),
    original_image_path TEXT NOT NULL,
    thumbnail_path TEXT,
    image_size INTEGER,
    image_dimensions VARCHAR(50),
    status VARCHAR(50) NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_qr_code ON test_strip_submissions(qr_code);
CREATE INDEX idx_created_at ON test_strip_submissions(created_at DESC);
```

### Image Processing Libraries

Recommended NPM packages:

- sharp - Image processing and thumbnail generation
- qrcode-reader or jsqr - QR code detection
- multer - File upload handling
- image-size - Extract image dimensions

### Best Practices to Demonstrate

1. Error Handling

   - Server returns clear status when QR code not found
   - Proper error messages for users based on server response
   - Retry logic for failed uploads

2. Performance

   - Image compression before upload
   - Lazy loading in history view
   - Efficient database queries

3. Security

   - File type validation
   - Size limits on uploads
   - SQL injection prevention
   - Input sanitization

4. Code Quality

- Clean architecture
- SOLID principles
- Comprehensive error types
- Proper logging
