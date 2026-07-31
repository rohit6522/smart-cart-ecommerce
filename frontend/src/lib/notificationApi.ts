import api from "./axios";
import { ApiResponse, Notification } from "@/types";

export const getMyNotifications = async () => {
  const res = await api.get<ApiResponse<Notification[]>>("/api/user/notifications");
  return res.data.data;
};

export const getUnreadCount = async () => {
  const res = await api.get<ApiResponse<{ count: number }>>("/api/user/notifications/unread-count");
  return res.data.data.count;
};

export const markAllAsRead = async () => {
  await api.put<ApiResponse<null>>("/api/user/notifications/mark-read");
};