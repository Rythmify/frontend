import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
<<<<<<< HEAD
=======
  // withCredentials: true, // TODO: re-enable once backend fixes CORS to allow http://localhost:5173 with credentials
>>>>>>> 6c9d16e92b7f619bb9071f653c94fc76a8bd77fb
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;



