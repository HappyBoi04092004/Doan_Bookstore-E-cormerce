// ─── Auth & User ────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  avatar?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

// ─── Book / Product ──────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Book {
  id: number;
  title: string;
  author: { name: string };
  category: { name: string };
  price: number;
  stock: number;
  description?: string;
  coverImage?: string;
  createdAt?: string;
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export interface CartItem {
  book: Book;
  quantity: number;
}

// ─── Order ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipping"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  book: Book;
  quantity: number;
  unitPrice: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface Order {
  id: string;
  user: User;
  items: OrderItem[];
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  totalAmount: number;
  paymentMethod: "cod" | "card" | "banking";
  createdAt: string;
  updatedAt: string;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BookFilters {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price" | "rating" | "newest" | "title";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}
