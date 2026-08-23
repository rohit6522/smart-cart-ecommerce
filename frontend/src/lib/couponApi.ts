import api from "./axios";
import { ApiResponse, CouponValidation, CouponInfo,Coupon, CouponFormPayload } from "@/types";


export const applyCoupon = async (code: string) => {
  const res = await api.post<ApiResponse<CouponValidation>>("/api/user/coupon/apply", { code });
  return res.data.data;
};

export const getMyCoupons = async () => {
  const res = await api.get<ApiResponse<CouponInfo[]>>("/api/user/coupons/my");
  return res.data.data;
};

export const getAllCoupons = async () => {
  const res = await api.get<ApiResponse<Coupon[]>>("/api/admin/coupons");
  return res.data.data;
};

export const createCoupon = async (payload: CouponFormPayload) => {
  const res = await api.post<ApiResponse<Coupon>>("/api/admin/coupons", payload);
  return res.data.data;
};

export const updateCoupon = async (id: number, payload: CouponFormPayload) => {
  const res = await api.put<ApiResponse<Coupon>>(`/api/admin/coupons/${id}`, payload);
  return res.data.data;
};

export const deleteCoupon = async (id: number) => {
  await api.delete<ApiResponse<null>>(`/api/admin/coupons/${id}`);
};