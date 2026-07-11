import api from "./axios";
import { ApiResponse, DeliveryAssignment, DeliveryBoy, DeliveryStatus } from "@/types";

// Admin only
export const getAllDeliveryBoys = async () => {
  const res = await api.get<ApiResponse<DeliveryBoy[]>>("/api/admin/delivery-boys");
  return res.data.data;
};

export const assignDelivery = async (orderId: number, deliveryBoyId: number) => {
  const res = await api.post<ApiResponse<DeliveryAssignment>>("/api/admin/delivery/assign", {
    orderId,
    deliveryBoyId,
  });
  return res.data.data;
};

// Delivery boy only
export const getMyDeliveries = async () => {
  const res = await api.get<ApiResponse<DeliveryAssignment[]>>("/api/delivery/my-deliveries");
  return res.data.data;
};

export const updateDeliveryStatus = async (assignmentId: number, status: DeliveryStatus) => {
  const res = await api.put<ApiResponse<DeliveryAssignment>>(
    `/api/delivery/${assignmentId}/status`,
    { status }
  );
  return res.data.data;
};