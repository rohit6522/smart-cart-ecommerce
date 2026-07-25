import api from "./axios";
import { ApiResponse, Product, ProductPayload } from "@/types";

let productsCache: { data: Product[]; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 1000; // 1 minute

export const getAllProducts = async (forceRefresh = false) => {
  if (!forceRefresh && productsCache && Date.now() - productsCache.timestamp < CACHE_DURATION) {
    return productsCache.data;
  }
  const res = await api.get<ApiResponse<Product[]>>("/api/products");
  productsCache = { data: res.data.data, timestamp: Date.now() };
  return res.data.data;
};

export const getProductById = async (id: number) => {
  const res = await api.get<ApiResponse<Product>>(`/api/products/${id}`);
  return res.data.data;
};

// Admin only - these should invalidate the cache since they change product data
export const createProduct = async (payload: ProductPayload) => {
  const res = await api.post<ApiResponse<Product>>("/api/admin/products", payload);
  productsCache = null;
  return res.data.data;
};

export const updateProduct = async (id: number, payload: ProductPayload) => {
  const res = await api.put<ApiResponse<Product>>(`/api/admin/products/${id}`, payload);
  productsCache = null;
  return res.data.data;
};

export const deleteProduct = async (id: number) => {
  const res = await api.delete<ApiResponse<null>>(`/api/admin/products/${id}`);
  productsCache = null;
  return res.data;
};