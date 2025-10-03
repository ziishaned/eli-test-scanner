export interface TestStripSubmission {
  id: string;
  qr_code?: string;
  original_image_path: string;
  thumbnail_path?: string;
  image_size: number;
  image_dimensions: string;
  status: SubmissionStatus;
  error_message?: string;
  created_at: Date;
}

export type SubmissionStatus = "valid" | "invalid" | "expired";

export interface TestStripListItem {
  id: string;
  qr_code?: string;
  status: SubmissionStatus;
  thumbnail_url?: string;
  created_at: Date;
}

export interface QRCodeData {
  data?: string;
  errorMessage?: string;
  status: SubmissionStatus;
}

export interface ImageProcessingResult {
  thumbnailPath?: string;
  imageDimensions: string;
  imageSize: number;
  qrCode?: QRCodeData;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
