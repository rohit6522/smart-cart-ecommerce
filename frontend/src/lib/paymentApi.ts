import api from "./axios";
import { ApiResponse, RazorpayOrderResponse } from "@/types";

export const createRazorpayOrder = async () => {
  const res = await api.post<ApiResponse<RazorpayOrderResponse>>("/api/user/payment/create-order");
  return res.data.data;
};