import api from "./axios";
import { ApiResponse, Address, AddressPayload } from "@/types";

export const getMyAddresses = async () => {
  const res = await api.get<ApiResponse<Address[]>>("/api/user/addresses");
  return res.data.data;
};

export const addAddress = async (payload: AddressPayload) => {
  const res = await api.post<ApiResponse<Address>>("/api/user/addresses", payload);
  return res.data.data;
};

export const updateAddress = async (id: number, payload: AddressPayload) => {
  const res = await api.put<ApiResponse<Address>>(`/api/user/addresses/${id}`, payload);
  return res.data.data;
};

export const deleteAddress = async (id: number) => {
  await api.delete<ApiResponse<null>>(`/api/user/addresses/${id}`);
};

export const setDefaultAddress = async (id: number) => {
  const res = await api.put<ApiResponse<Address>>(`/api/user/addresses/${id}/set-default`);
  return res.data.data;
};