import axios from "axios";

// Get API base URL from environment or use default
// Use localhost for development, production URL for production
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENVIRONMENT === 'development';
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 
  (isDevelopment ? "http://localhost:5055/api" : "https://e-commerce-backend-l0s0.onrender.com/api");

console.log('🔍 DEBUG: Environment:', process.env.NODE_ENV);
console.log('🔍 DEBUG: API Base URL:', apiBaseUrl);

// Create axios instance with default config
const httpServices = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
httpServices.interceptors.request.use(
  (config) => {
    console.log('🔍 DEBUG: HTTP Request:', config.method?.toUpperCase(), config.url);
    console.log('🔍 DEBUG: Request data:', config.data);
    
    // Get token from localStorage if available
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔍 DEBUG: Token added to request');
      } else {
        console.log('🔍 DEBUG: No token found in localStorage');
      }
    }
    return config;
  },
  (error) => {
    console.error('🔍 DEBUG: Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
httpServices.interceptors.response.use(
  (response) => {
    console.log('🔍 DEBUG: HTTP Response:', response.status, response.config.url);
    console.log('🔍 DEBUG: Response data:', response.data);
    return response.data;
  },
  (error) => {
    console.error('🔍 DEBUG: HTTP Response Error:', error.response?.status, error.config?.url);
    console.error('🔍 DEBUG: Error details:', error.response?.data);
    console.error('🔍 DEBUG: Error message:', error.message);
    
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear session data
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");
        
        // Redirect to login page if not already there
        if (window.location.pathname !== "/login" && window.location.pathname !== "/") {
          window.location.href = "/login";
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Token management functions
const setToken = (token) => {
  if (token) {
    httpServices.defaults.headers.common.Authorization = `Bearer ${token}`;
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
  }
};

const clearToken = () => {
  delete httpServices.defaults.headers.common.Authorization;
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
};

export { setToken, clearToken };
export default httpServices; 
