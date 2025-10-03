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
}

export interface SubmissionResponse {
  id: string;
  status: SubmissionStatus;
  qrCode?: string;
  qrCodeValid?: boolean;
}
