// ---------- Auth ----------
export type Role = "USER" | "ADMIN" | "DELIVERY_BOY";

export interface AuthResponse {
  token: string;
  userId: number;
  name: string;
  email: string;
  role: Role;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  role?: Role;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ---------- Product ----------
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPercentage: number;
  discountedPrice: number;
  stockQuantity: number;
  category: string;
  imageUrl: string;
  createdAt: string;
  averageRating: number;
  totalReviews: number;
}

export interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewPayload {
  rating: number;
  comment: string;
}

export interface ProductPayload {
  name: string;
  description: string;
  price: number;
  discountPercentage: number;
  stockQuantity: number;
  category: string;
  imageUrl: string;
}

// ---------- Cart / Budget ----------
export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  imageUrl: string;
  priceAtAdd: number;
  quantity: number;
  subtotal: number;
}

export interface CartResponse {
  cartId: number;
  items: CartItem[];
  cartTotal: number;
  totalBudget: number;
  currentSpent: number;
  remainingBudget: number;
  overBudget: boolean;
  percentageUsed: number;
}

export interface WishlistItem {
  wishlistId: number;
  product: Product;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURN_REQUESTED"
  | "RETURNED"
  | "RETURN_REJECTED";

export interface OrderResponse {
  orderId: number;
  status: OrderStatus;
  totalAmount: number;
  deliveryAddress: string;
  items: OrderItem[];
  createdAt: string;
  deliveryBoyName: string | null;
  deliveryBoyPhone: string | null;
  paymentStatus: string;
  cancellationReason: string | null;
  returnReason: string | null;
  deliveredAt: string | null;
  returnRequestedAt: string | null;
  canCancel: boolean;
  canReturn: boolean;

  couponCode: string | null;
discountAmount: number;
}

  export interface OrderItem {
    productId: number;
    productName: string;
    imageUrl: string;
    quantity: number;
    priceAtPurchase: number;
    subtotal: number;
  }

  export interface CouponValidation {
  code: string;
  discountAmount: number;
  cartTotal: number;
  finalTotal: number;
} 

// ---------- Delivery ----------
export type DeliveryStatus = "ASSIGNED" | "PICKED_UP" | "DELIVERED";

export interface DeliveryBoy {
  id: number;
  name: string;
  phone: string;
  email: string;
}

export interface DeliveryAssignment {
  assignmentId: number;
  orderId: number;
  status: DeliveryStatus;
  assignedAt: string;
  deliveredAt: string | null;
  orderTotal: number;
  deliveryAddress: string;
  customerName: string;
  customerPhone: string;
}

// ---------- Generic API wrapper (matches backend ApiResponse<T>) ----------
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface RazorpayOrderResponse {
  razorpayOrderId: string;
  razorpayKeyId: string;
  amount: number;
  currency: string;
}


export interface Address {
  id: number;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
}

export interface AddressPayload {
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
}


export interface Notification {
  id: number;
  title: string;
  message: string;
  orderId: number | null;
  isRead: boolean;
  createdAt: string;
}

export interface DeliveryEarnings {
  totalDeliveries: number;
  deliveriesToday: number;
  deliveriesThisMonth: number;
  totalEarnings: number;
  earningsToday: number;
  earningsThisMonth: number;
  perDeliveryFee: number;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  role?: Role;
  referralCode?: string;
}

export interface ReferralInfo {
  referralCode: string;
  totalReferred: number;
}

export interface CouponInfo {
  id: number;
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  minOrderValue: number;
  firstOrderOnly: boolean;
}


export interface DailyRevenue {
  date: string;
  revenue: number;
}

export interface CategorySales {
  category: string;
  revenue: number;
  orderCount: number;
}

export interface TopProduct {
  productName: string;
  unitsSold: number;
  revenue: number;
}

export interface AnalyticsData {
  revenueTrend: DailyRevenue[];
  categorySales: CategorySales[];
  topProducts: TopProduct[];
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
}

export interface LoginOtpResponse {
  message: string;
  email: string;
}