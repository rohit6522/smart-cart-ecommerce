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