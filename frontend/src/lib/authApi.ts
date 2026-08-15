import api from "./axios";
import { ApiResponse, AuthResponse, LoginOtpResponse, LoginPayload, RegisterPayload, ReferralInfo } from "@/types";

export const registerUser = async (payload: RegisterPayload) => {
  const res = await api.post<ApiResponse<AuthResponse>>("/api/auth/register", payload);
  return res.data.data;
};

export const loginUser = async (payload: LoginPayload) => {
  const res = await api.post<ApiResponse<LoginOtpResponse>>("/api/auth/login", payload);
  return res.data.data;
};

export const verifyOtp = async (email: string, otp: string) => {
  const res = await api.post<ApiResponse<AuthResponse>>("/api/auth/verify-otp", { email, otp });
  return res.data.data;
};

export const getMyReferralInfo = async () => {
  const res = await api.get<ApiResponse<ReferralInfo>>("/api/user/referral");
  return res.data.data;
};

export const updateProfilePhoto = async (base64Photo: string) => {
  const res = await api.put<ApiResponse<string>>("/api/user/profile-photo", { profilePhoto: base64Photo });
  return res.data.data;
};

export const getProfilePhoto = async () => {
  const res = await api.get<ApiResponse<string | null>>("/api/user/profile-photo");
  return res.data.data;
};

