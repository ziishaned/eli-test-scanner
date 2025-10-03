export interface TestSubmission {
  id: string;
  timestamp: Date;
  imageUri: string;
  qrCodeDetected: boolean;
  qrCodeData?: string;
  status: "pending" | "processed" | "error";
  errorMessage?: string;
}

export interface AppState {
  submissions: TestSubmission[];
  isOffline: boolean;
  isLoading: boolean;
  error: string | null;
}

export type RootTabParamList = {
  Camera: undefined;
  History: undefined;
};
