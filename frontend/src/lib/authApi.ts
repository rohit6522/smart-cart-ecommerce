import api from "./axios";
import { ApiResponse, AuthResponse, LoginPayload, RegisterPayload } from "@/types";

export const registerUser = async (payload: RegisterPayload) => {
  const res = await api.post<ApiResponse<AuthResponse>>("/api/auth/register", payload);
  return res.data.data;
};

export const loginUser = async (payload: LoginPayload) => {
  const res = await api.post<ApiResponse<AuthResponse>>("/api/auth/login", payload);
  return res.data.data;
};