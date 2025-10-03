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

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface SubmissionsResponse {
  data: SubmissionData[];
  pagination: PaginationData;
}

export const getTestStripById = async (id: string): Promise<SubmissionData> => {
  const response = await apiClient.get(`/api/test-strips/${id}`);
  return response.data;
};

export const getTestStrips = async (
  page: number = 1,
  limit: number = 20
): Promise<SubmissionsResponse> => {
  const response = await apiClient.get(
    `/api/test-strips?page=${page}&limit=${limit}`
  );
  return response.data;
};

export const uploadTestStrip = async (
  imageUri: string
): Promise<SubmissionData> => {
  const formData = new FormData();

  formData.append("image", {
    uri: imageUri,
    type: "image/jpeg",
    name: "test-strip.jpg",
  } as unknown as Blob);

  const response = await apiClient.post("/api/test-strips/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};
