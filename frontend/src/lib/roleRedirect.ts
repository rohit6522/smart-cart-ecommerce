import { Role } from "@/types";

export const getDashboardPath = (role: Role): string => {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "DELIVERY_BOY":
      return "/delivery";
    case "USER":
    default:
      return "/user";
  }
};