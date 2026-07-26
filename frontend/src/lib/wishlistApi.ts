import api from "./axios";
import { ApiResponse, WishlistItem } from "@/types";

export const getMyWishlist = async () => {
  const res = await api.get<ApiResponse<WishlistItem[]>>("/api/user/wishlist");
  return res.data.data;
};

export const addToWishlist = async (productId: number) => {
  await api.post<ApiResponse<null>>(`/api/user/wishlist/${productId}`);
};

export const removeFromWishlist = async (productId: number) => {
  await api.delete<ApiResponse<null>>(`/api/user/wishlist/${productId}`);
};