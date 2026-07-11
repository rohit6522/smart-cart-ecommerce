import api from "./axios";
import { ApiResponse, CartResponse } from "@/types";

export const getCart = async () => {
  const res = await api.get<ApiResponse<CartResponse>>("/api/user/cart");
  return res.data.data;
};

export const addToCart = async (productId: number, quantity: number) => {
  const res = await api.post<ApiResponse<CartResponse>>("/api/user/cart/add", {
    productId,
    quantity,
  });
  return res.data.data;
};

export const updateCartItem = async (cartItemId: number, quantity: number) => {
  const res = await api.put<ApiResponse<CartResponse>>(`/api/user/cart/item/${cartItemId}`, {
    quantity,
  });
  return res.data.data;
};

export const removeCartItem = async (cartItemId: number) => {
  const res = await api.delete<ApiResponse<CartResponse>>(`/api/user/cart/item/${cartItemId}`);
  return res.data.data;
};

export const setBudget = async (totalBudget: number) => {
  const res = await api.post<ApiResponse<CartResponse>>("/api/user/cart/budget", {
    totalBudget,
  });
  return res.data.data;
};