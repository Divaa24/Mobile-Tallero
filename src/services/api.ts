import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Cek IPv4 Wi-Fi laptop lewat perintah `ipconfig` di terminal jika tes pakai HP fisik (Expo Go)
const LOCAL_IP = "192.168.1.5";

export const SERVER_URL =
  Platform.OS === "web" ? "http://localhost:5000" : `http://${LOCAL_IP}:5000`;

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || `${SERVER_URL}/api/v1`;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    "Content-Type": "application/json",
    "X-Client": "mobile",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("tallero_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper untuk mengekstrak payload baik format { data: ... } maupun langsung
export const unwrapData = <T = any>(response: any): T => {
  if (response?.data?.data !== undefined) {
    return response.data.data;
  }
  return response?.data;
};

// Helper untuk membaca pesan error dari Zod / Express backend
export const getErrorMessage = (error: any, fallback = "Terjadi kesalahan pada server"): string => {
  const resData = error?.response?.data;
  if (Array.isArray(resData?.errors) && resData.errors.length > 0) {
    return resData.errors.map((e: any) => e.message || e).join("\n");
  }
  if (typeof resData?.message === "string") {
    return resData.message;
  }
  if (error?.message === "Network Error") {
    return `Gagal terhubung ke server (${API_BASE_URL}). Pastikan backend Tallero-be menyala.`;
  }
  return fallback;
};

export default api;