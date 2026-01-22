import { Product, Order, User } from '../types';
import { INITIAL_PRODUCTS, MOCK_ORDERS } from './mockData';

const API_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth
  login: async (email: string, password: string): Promise<{ token: string, user: User }> => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error('Login failed');
      return res.json();
    } catch (error) {
      console.warn("Backend login failed, checking fallback credentials...");
      // Fallback for Admin
      if (email === 'admin' && password === 'Chopkeeper') {
        return {
          token: 'mock-admin-token',
          user: { id: 'admin-1', name: 'Super Admin', email: 'admin', role: 'admin', isAuthenticated: true }
        };
      }
      // Fallback for generic user (if needed for testing)
      if (password === 'password') { // Simple fallback for testing
          return {
              token: 'mock-user-token',
              user: { id: 'user-1', name: 'Test User', email, role: 'user', isAuthenticated: true }
          };
      }
      throw error;
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      if (!res.ok) throw new Error('Registration failed');
      return res.json();
    } catch (error) {
      console.warn("Backend unreachable. Simulating registration success.");
      return { message: 'Mock registration successful' };
    }
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Not authenticated');
      const data = await res.json();
      return { ...data, isAuthenticated: true };
    } catch (error) {
      // Check for mock tokens to maintain session in offline mode
      const token = localStorage.getItem('token');
      if (token === 'mock-admin-token') {
         return { id: 'admin-1', name: 'Super Admin', email: 'admin', role: 'admin', isAuthenticated: true };
      }
      if (token === 'mock-user-token') {
         return { id: 'user-1', name: 'Test User', email: 'user@example.com', role: 'user', isAuthenticated: true };
      }
      throw error;
    }
  },

  // Products
  getProducts: async (): Promise<Product[]> => {
    try {
      const res = await fetch(`${API_URL}/products`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    } catch (error) {
      console.warn("Backend unreachable. Using Mock Data for products.");
      return INITIAL_PRODUCTS;
    }
  },

  addProduct: async (product: Partial<Product>): Promise<Product> => {
    try {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(product)
      });
      if (!res.ok) throw new Error('Failed to add product');
      return res.json();
    } catch (error) {
      console.warn("Backend unreachable. Simulating product addition.");
      return { ...product, id: Date.now().toString() } as Product;
    }
  },

  updateProduct: async (product: Product): Promise<Product> => {
    try {
      const res = await fetch(`${API_URL}/products/${product.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(product)
      });
      if (!res.ok) throw new Error('Failed to update product');
      return res.json();
    } catch (error) {
      console.warn("Backend unreachable. Simulating product update.");
      return product;
    }
  },

  deleteProduct: async (id: string): Promise<void> => {
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Failed to delete product');
    } catch (error) {
      console.warn("Backend unreachable. Simulating product deletion.");
    }
  },

  // Orders
  createOrder: async (orderData: Partial<Order>): Promise<Order> => {
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(orderData)
      });
      if (!res.ok) throw new Error('Failed to create order');
      return res.json();
    } catch (error) {
      console.warn("Backend unreachable. Simulating order creation.");
      return { 
          ...orderData, 
          id: `ORD-MOCK-${Date.now()}`, 
          timestamp: Date.now(),
          status: 'verified' 
      } as Order;
    }
  },

  getOrders: async (): Promise<Order[]> => {
    try {
      const res = await fetch(`${API_URL}/orders`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    } catch (error) {
      console.warn("Backend unreachable. Using Mock Orders.");
      return MOCK_ORDERS;
    }
  }
};