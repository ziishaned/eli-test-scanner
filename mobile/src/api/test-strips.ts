import { apiClient } from "./client";

export interface SubmissionData {
  id: string;
  qr_code?: string;
  original_image_path: string;
  thumbnail_path?: string;
  image_size: number;
  image_dimensions: string;
  status: "valid" | "invalid" | "expired";
  error_message?: string;
  created_at: string;
}

export const getTestStripById = async (id: string): Promise<SubmissionData> => {
  const response = await apiClient.get(`/api/test-strips/${id}`);
  return response.data;
};
