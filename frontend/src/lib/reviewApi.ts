import api from "./axios";
import { ApiResponse, Review, ReviewPayload } from "@/types";

export const getProductReviews = async (productId: number) => {
  const res = await api.get<ApiResponse<Review[]>>(`/api/products/${productId}/reviews`);
  return res.data.data;
};

export const submitReview = async (productId: number, payload: ReviewPayload) => {
  const res = await api.post<ApiResponse<Review>>(
    `/api/user/products/${productId}/reviews`,
    payload
  );
  return res.data.data;
};