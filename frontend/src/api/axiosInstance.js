import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://collectfee.vercel.app/api",
});

// url:https://collectfee.onrender.com,https://collectfee.vercel.app/api
// Automatically attach token to headers
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle Unauthorized token (401)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      localStorage.removeItem("token");
      // window.location.href = "/login"; // redirect to login
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
