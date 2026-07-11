import api from "./axios";
import { ApiResponse, OrderResponse, OrderStatus } from "@/types";

export const checkout = async (deliveryAddress: string) => {
  const res = await api.post<ApiResponse<OrderResponse>>("/api/user/orders/checkout", {
    deliveryAddress,
  });
  return res.data.data;
};

export const getMyOrders = async () => {
  const res = await api.get<ApiResponse<OrderResponse[]>>("/api/user/orders");
  return res.data.data;
};

export const getOrderById = async (orderId: number) => {
  const res = await api.get<ApiResponse<OrderResponse>>(`/api/user/orders/${orderId}`);
  return res.data.data;
};

// Admin only
export const getAllOrders = async () => {
  const res = await api.get<ApiResponse<OrderResponse[]>>("/api/admin/orders");
  return res.data.data;
};

export const updateOrderStatus = async (orderId: number, status: OrderStatus) => {
  const res = await api.put<ApiResponse<OrderResponse>>(`/api/admin/orders/${orderId}/status`, {
    status,
  });
  return res.data.data;
};