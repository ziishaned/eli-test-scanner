import axios from "axios";

const baseURL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
const uploadsBaseURL = `${baseURL}/uploads`;

const apiClient = axios.create({
  baseURL,
  timeout: 10000,
});

export { apiClient, uploadsBaseURL };
