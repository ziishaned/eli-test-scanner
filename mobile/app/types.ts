export interface QRCodeData {
  detected: boolean;
  content?: string;
  confidence?: number;
}

export interface Submission {
  id: string;
  imageUri: string;
  timestamp: Date;
  qrCode: QRCodeData | null;
  status: "pending" | "processed" | "error";
}

export interface SubmissionResponse {
  id: string;
  qrCode: QRCodeData;
  status: "processed" | "error";
  message?: string;
}
