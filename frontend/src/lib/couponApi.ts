import api from "./axios";
import { ApiResponse, CouponValidation } from "@/types";

export const applyCoupon = async (code: string) => {
  const res = await api.post<ApiResponse<CouponValidation>>("/api/user/coupon/apply", { code });
  return res.data.data;
};