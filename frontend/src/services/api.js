import axios from "axios";
import { getStoredToken } from "./authStorage";

const configuredBaseUrl = process.env.REACT_APP_API_BASE_URL?.trim();
const fallbackBaseUrl = "https://ur-pharmacy-api.onrender.com/api";
// const fallbackBaseUrl = "http://localhost:5000/api";

const api = axios.create({
  baseURL: configuredBaseUrl || fallbackBaseUrl,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
