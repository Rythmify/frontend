import axios from 'axios';

const REFRESH_FAILURE_COOLDOWN_MS = 30_000;

function normalizeApiBaseUrl(rawBaseUrl?: string) {
  if (!rawBaseUrl) {
    return '/api/v1';
  }

  const trimmedBaseUrl = rawBaseUrl.trim().replace(/\/+$/, '');
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
  if (config.url?.includes('/auth/refresh')) return config;
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

// Shared refresh function — both the proactive timer and the 401 interceptor
// use this so at most one /auth/refresh request is in-flight at any time.
// This prevents refresh-token rotation failures when two code paths race.
export function performRefresh(): Promise<string | null> {
  refreshRequest ??= axiosInstance
    .post('/auth/refresh')
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
  return refreshRequest;
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
      const refreshedToken = await performRefresh();

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



