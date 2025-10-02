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