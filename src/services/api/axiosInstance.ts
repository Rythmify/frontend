import axios from 'axios';

const REFRESH_FAILURE_COOLDOWN_MS = 30_000;

function normalizeApiBaseUrl(rawBaseUrl?: string) {
  if (!rawBaseUrl) {
    return '/api/v1';
  }

  const trimmedBaseUrl = rawBaseUrl.replace(/\/+$/, '');
  return /\/api\/v1$/i.test(trimmedBaseUrl)
    ? trimmedBaseUrl
    : `${trimmedBaseUrl}/api/v1`;
}

const axiosInstance = axios.create({
  baseURL: normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshRequest: Promise<string | null> | null = null;
let lastRefreshFailureAt = 0;

function clearAuthSession() {
  localStorage.removeItem('auth_token');
  window.dispatchEvent(new CustomEvent('auth:session-expired'));
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (typeof error.config & {
      _retry?: boolean;
    });

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    if (
      !localStorage.getItem('auth_token') ||
      Date.now() - lastRefreshFailureAt < REFRESH_FAILURE_COOLDOWN_MS
    ) {
      clearAuthSession();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshRequest ??= axios
        .post(
          `${normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL)}/auth/refresh`,
          undefined,
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )
        .then((response) => {
          const refreshedToken = response.data?.data?.access_token ?? null;
          if (refreshedToken) {
            localStorage.setItem('auth_token', refreshedToken);
          }
          return refreshedToken;
        })
        .finally(() => {
          refreshRequest = null;
        });

      const refreshedToken = await refreshRequest;

      if (!refreshedToken) {
        lastRefreshFailureAt = Date.now();
        clearAuthSession();
        return Promise.reject(error);
      }

      lastRefreshFailureAt = 0;

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${refreshedToken}`;

      return axiosInstance(originalRequest);
    } catch (refreshError) {
      lastRefreshFailureAt = Date.now();
      clearAuthSession();
      return Promise.reject(refreshError);
    }
  },
);

export default axiosInstance;



