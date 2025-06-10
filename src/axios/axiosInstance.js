import axios from "axios";

// Axios instance with base URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage only
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Handle unauthorized access
          console.error("Unauthorized access - Please login again");
          // Clear token from localStorage
          localStorage.removeItem("token");
          // Redirect to login page if we're in browser environment
          if (typeof window !== undefined) {
            window.location.href = "/login";
          }
          break;

        case 403:
          console.error("Forbidden - You don't have permission");
          break;
        case 404:
          console.error("Resource not found");
          break;
        case 500:
          console.error("Server error");
          break;
        default:
          console.error("An error occurred");
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received", error.request);
    } else {
      // Something happened in setting up the request
      console.error("Request error", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
