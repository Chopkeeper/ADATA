export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPercent: number;
  category: string;
  image: string; // Keep for backward compatibility (Thumbnail)
  images?: string[]; // New field for multiple images
  stock: number;
  shippingCost: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isAuthenticated: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'fixed' | 'percent' | 'free_shipping';
  value: number; // Amount in THB or Percentage
  isActive: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  
  // Financial breakdown
  subtotal: number;
  shippingTotal: number;
  taxAmount: number;
  discountTotal: number;
  totalAmount: number; // Final Grand Total
  
  status: 'pending' | 'paid' | 'verified' | 'shipped' | 'issue_reported';
  paymentMethod: 'promptpay';
  timestamp: number;
  slipImage?: string;
  
  // Admin Management
  adminNote?: string; // For reporting issues
  appliedCoupons?: string[]; // List of codes used
}

export interface RevenueData {
  name: string; // Month/Quarter name
  revenue: number;
}

export enum AppRoute {
  HOME = '/',
  LOGIN = '/login',
  REGISTER = '/register',
  PRODUCT_DETAIL = '/product/:id',
  CART = '/cart',
  CHECKOUT = '/checkout',
  ADMIN_DASHBOARD = '/admin/dashboard',
  ADMIN_PRODUCTS = '/admin/products',
  ADMIN_ORDERS = '/admin/orders',
}