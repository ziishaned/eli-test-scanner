import axios from "axios";

const apiClient = axios.create({
  timeout: 10000,
  baseURL: "https://0e251d280bf8.ngrok-free.app",
});

const uploadsBaseURL = `${apiClient.defaults.baseURL}/uploads`;

export { apiClient, uploadsBaseURL };
