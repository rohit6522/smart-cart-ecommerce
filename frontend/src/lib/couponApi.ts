import api from "./axios";
import { ApiResponse, CouponValidation } from "@/types";
import { CouponResponse } from "@/types";

export const applyCoupon = async (code: string) => {
  const res = await api.post<ApiResponse<CouponValidation>>("/api/user/coupon/apply", { code });
  return res.data.data;
};

export const getMyCoupons = async () => {
  const res = await api.get<ApiResponse<CouponInfo[]>>("/api/user/coupons/my");
  return res.data.data;
};