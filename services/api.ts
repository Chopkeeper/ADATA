import { Product, Order, User } from '../types';

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
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  register: async (name: string, email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    if (!res.ok) throw new Error('Registration failed');
    return res.json();
  },

  getCurrentUser: async (): Promise<User> => {
    const res = await fetch(`${API_URL}/auth/me`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Not authenticated');
    const data = await res.json();
    return { ...data, isAuthenticated: true };
  },

  // Products
  getProducts: async (): Promise<Product[]> => {
    const res = await fetch(`${API_URL}/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  addProduct: async (product: Partial<Product>): Promise<Product> => {
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error('Failed to add product');
    return res.json();
  },

  updateProduct: async (product: Product): Promise<Product> => {
    const res = await fetch(`${API_URL}/products/${product.id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error('Failed to update product');
    return res.json();
  },

  deleteProduct: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete product');
  },

  // Orders
  createOrder: async (orderData: Partial<Order>): Promise<Order> => {
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData)
    });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
  },

  getOrders: async (): Promise<Order[]> => {
    const res = await fetch(`${API_URL}/orders`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  }
};