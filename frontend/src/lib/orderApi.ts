import api from "./axios";
import { ApiResponse, OrderResponse, OrderStatus } from "@/types";

interface CheckoutPayload {
  deliveryAddress: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  couponCode?: string;
}
export const checkout = async (payload: CheckoutPayload) => {
  const res = await api.post<ApiResponse<OrderResponse>>("/api/user/orders/checkout", payload);
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


export const cancelOrder = async (orderId: number, reason: string) => {
  const res = await api.put<ApiResponse<OrderResponse>>(`/api/user/orders/${orderId}/cancel`, {
    reason,
  });
  return res.data.data;
};

export const requestReturn = async (orderId: number, reason: string) => {
  const res = await api.put<ApiResponse<OrderResponse>>(`/api/user/orders/${orderId}/return`, {
    reason,
  });
  return res.data.data;
};

export const resolveReturn = async (orderId: number, approve: boolean) => {
  const res = await api.put<ApiResponse<OrderResponse>>(
    `/api/admin/orders/${orderId}/resolve-return?approve=${approve}`
  );
  return res.data.data;
};