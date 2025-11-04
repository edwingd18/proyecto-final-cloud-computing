import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api-gateway-production-7894.up.railway.app/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Interceptor para agregar token si existe (futuro)
api.interceptors.request.use(
  (config) => {
    // Aquí se puede agregar token de autenticación en el futuro
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Error desconocido";
    console.error("Error en API:", message);
    return Promise.reject(error);
  }
);

export default api;
