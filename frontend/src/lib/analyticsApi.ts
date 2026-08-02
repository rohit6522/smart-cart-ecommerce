import api from "./axios";
import { ApiResponse, AnalyticsData } from "@/types";

export const getAnalytics = async () => {
  const res = await api.get<ApiResponse<AnalyticsData>>("/api/admin/analytics");
  return res.data.data;
};