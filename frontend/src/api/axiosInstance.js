import axios from "axios";

const API_BASE_URL = "/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Access Token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("civis_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If payload is FormData, let the browser / axios auto-set Content-Type with boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Auto-Refresh on 401 Unauthorized
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite refresh loop for auth endpoints
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/refresh-token")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("civis_refresh_token");
      if (!refreshToken) {
        isRefreshing = false;
        localStorage.removeItem("civis_access_token");
        localStorage.removeItem("civis_user");
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const newAccessToken = res.data?.data?.accessToken;
        const newRefreshToken = res.data?.data?.refreshToken;

        localStorage.setItem("civis_access_token", newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem("civis_refresh_token", newRefreshToken);
        }

        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem("civis_access_token");
        localStorage.removeItem("civis_refresh_token");
        localStorage.removeItem("civis_user");
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
