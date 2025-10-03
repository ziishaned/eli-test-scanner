export type SubmissionStatus =
  | "processing"
  | "completed"
  | "failed"
  | "qr_not_found"
  | "qr_invalid"
  | "qr_expired";

export interface Submission {
  id: string;
  imageUri: string;
  timestamp: Date;
  qrCode?: string;
  qrCodeValid?: boolean;
  status: SubmissionStatus;
  processedAt: Date;
}

export interface SubmissionResponse {
  id: string;
  status: SubmissionStatus;
  qrCode?: string;
  qrCodeValid?: boolean;
  processedAt: Date;
}
