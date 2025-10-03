export interface TestSubmission {
  id: string;
  imagePath: string;
  timestamp: Date;
  qrCode?: string;
  status: 'pending' | 'processed' | 'error';
}

export interface CameraState {
  isCapturing: boolean;
  capturedImage?: string;
  isSubmitting: boolean;
}

export interface AppState {
  submissions: TestSubmission[];
  isOnline: boolean;
}
