import { DeliveryStatus } from "@/types";

interface DeliveryStatusBadgeProps {
  status: DeliveryStatus;
}

const statusStyles: Record<DeliveryStatus, string> = {
  ASSIGNED: "bg-yellow-50 text-yellow-700",
  PICKED_UP: "bg-blue-50 text-blue-700",
  DELIVERED: "bg-green-50 text-green-700",
};

const statusLabels: Record<DeliveryStatus, string> = {
  ASSIGNED: "Assigned",
  PICKED_UP: "Picked Up",
  DELIVERED: "Delivered",
};

export default function DeliveryStatusBadge({ status }: DeliveryStatusBadgeProps) {
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}