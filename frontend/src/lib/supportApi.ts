import api from "./axios";
import { ApiResponse, SupportTicket } from "@/types";

export const submitTicket = async (subject: string, message: string) => {
  const res = await api.post<ApiResponse<SupportTicket>>("/api/user/support", { subject, message });
  return res.data.data;
};

export const getMyTickets = async () => {
  const res = await api.get<ApiResponse<SupportTicket[]>>("/api/user/support/my-tickets");
  return res.data.data;
};

export const getAllTickets = async () => {
  const res = await api.get<ApiResponse<SupportTicket[]>>("/api/admin/support/tickets");
  return res.data.data;
};

export const resolveTicket = async (id: number) => {
  const res = await api.put<ApiResponse<SupportTicket>>(`/api/admin/support/tickets/${id}/resolve`);
  return res.data.data;
};