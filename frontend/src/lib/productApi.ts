import api from "./axios";
import { ApiResponse, Product, ProductPayload } from "@/types";

export const getAllProducts = async () => {
  const res = await api.get<ApiResponse<Product[]>>("/api/products");
  return res.data.data;
};

export const getProductById = async (id: number) => {
  const res = await api.get<ApiResponse<Product>>(`/api/products/${id}`);
  return res.data.data;
};

// Admin only
export const createProduct = async (payload: ProductPayload) => {
  const res = await api.post<ApiResponse<Product>>("/api/admin/products", payload);
  return res.data.data;
};

export const updateProduct = async (id: number, payload: ProductPayload) => {
  const res = await api.put<ApiResponse<Product>>(`/api/admin/products/${id}`, payload);
  return res.data.data;
};

export const deleteProduct = async (id: number) => {
  const res = await api.delete<ApiResponse<null>>(`/api/admin/products/${id}`);
  return res.data;
};