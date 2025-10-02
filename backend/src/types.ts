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

export type SubmissionStatus =
  | "processing"
  | "completed"
  | "failed"
  | "qr_not_found"
  | "qr_invalid"
  | "qr_expired";

export interface UploadResponse {
  id: string;
  status: SubmissionStatus;
  qr_code?: string;
  qr_code_valid?: boolean;
  quality: "good" | "poor" | "failed";
  processed_at: Date;
}

export interface TestStripListItem {
  id: string;
  qr_code?: string;
  status: SubmissionStatus;
  quality: "good" | "poor" | "failed";
  thumbnail_url?: string;
  created_at: Date;
}

export interface QRCodeData {
  data: string;
  isValid: boolean;
  isExpired: boolean;
}

export interface ImageProcessingResult {
  thumbnailPath?: string;
  imageDimensions: string;
  imageSize: number;
  qrCode?: QRCodeData;
  quality: "good" | "poor" | "failed";
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
