import { OrderStatus } from "@/types";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const statusStyles: Record<OrderStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border border-amber-200/60",
  CONFIRMED: "bg-blue-50 text-blue-700 border border-blue-200/60",
  OUT_FOR_DELIVERY: "bg-indigo-50 text-indigo-700 border border-indigo-200/60",
  DELIVERED: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
  CANCELLED: "bg-rose-50 text-rose-700 border border-rose-200/60",
  RETURN_REQUESTED: "bg-orange-50 text-orange-700 border border-orange-200/60",
  RETURNED: "bg-slate-100 text-slate-700 border border-slate-200/60",
  RETURN_REJECTED: "bg-rose-50 text-rose-700 border border-rose-200/60",
};

const statusLabels: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURN_REQUESTED: "Return Requested",
  RETURNED: "Returned",
  RETURN_REJECTED: "Return Rejected",
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusStyles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}