import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Attach token from localStorage (fallback to cookie auth on the server)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mehzhaya_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize errors & handle auth termination
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("mehzhaya_user");
      localStorage.removeItem("mehzhaya_token");
      try {
        sessionStorage.clear();
      } catch {
        /* ignore */
      }
    }
    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

export default api;
