import axios from 'axios';

// Buat instance Axios baru
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Tambahkan Interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Ambil token dari localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // Jika ada token, tambahkan ke header Authorization
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;