import axios from "axios";

const api = axios.create({
  baseURL: "https://ur-pharmacy-api.onrender.com/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // hoặc adminToken

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;


