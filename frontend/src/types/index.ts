// ─── Auth & User ────────────────────────────────────────────────────────────

export interface User {
  id: number;
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
  id: number;
  name: string;
  image?: string;
}

export interface BookImage {
  id: number;
  bookId: number;
  variantId?: number | null;
  url: string;
  altText?: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface BookAttribute {
  id: number;
  attributeId: number;
  name: string;
  unit?: string | null;
  value: string;
}

export interface Attribute {
  id: number;
  name: string;
  unit?: string | null;
}

export interface BookVariant {
  id: number;
  bookId: number;
  name: string;
  sku?: string | null;
  price: number;
  stock: number;
  discountPercent?: number | null;
  primaryImage?: string | null;
  images?: BookImage[];
}

export interface Book {
  id: number;
  title: string;
  author: { id?: number; name: string } | string;
  category: { id?: number; name: string } | string;
  price: number;
  stock: number;
  description?: string;
  primaryImage?: string | null;
  images: BookImage[];
  attributes: BookAttribute[];
  variants: BookVariant[];
  createdAt?: string;
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export interface CartItem {
  variant: BookVariant & { book: Book };
  quantity: number;
}

// ─── Order ───────────────────────────────────────────────────────────────────

export type OrderStatus = "PENDING" | "PAID" | "CANCELLED" | "FAILED";

export interface OrderItem {
  id: number;
  variantId: number;
  qty: number;
  price: number;
  variant: BookVariant & { book: Book };
}

export interface Order {
  id: number;
  userId: number;
  status: OrderStatus;
  total: number;
  createdAt: string;
  paymentMethod?: string;
  address?: {
    name: string;
    phone: string;
    street: string;
    detail: string;
    wardCode: number;
    districtCode: number;
    provinceCode: number;
  };
  items: OrderItem[];
  user?: Pick<User, "id" | "name" | "email">;
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
