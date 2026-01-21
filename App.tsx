import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import Checkout from './pages/Checkout';
import { Product, User, CartItem, Order } from './types';
import { INITIAL_PRODUCTS, MOCK_ORDERS } from './services/mockData';

// Mock Auth Service for simplicity in one file
const mockUser: User = {
  id: 'u1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user',
  isAuthenticated: true
};

const mockAdmin: User = {
  id: 'a1',
  name: 'Admin Manager',
  email: 'admin@advice-clone.com',
  role: 'admin',
  isAuthenticated: true
};

// Login Component
const LoginForm: React.FC<{ onLogin: (u: string, p: string, isAdmin: boolean) => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password, isAdminMode);
  };

  return (
    <div className="flex flex-col items-center justify-center h-[80vh]">
       <div className="bg-white/95 backdrop-blur-sm p-8 rounded shadow-lg w-96">
          <h2 className="text-2xl font-bold mb-6 text-center text-advice-blue">
            {isAdminMode ? 'Admin System' : 'Member Login'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border p-2 rounded focus:ring-2 ring-advice-blue outline-none"
                placeholder={isAdminMode ? "admin" : "Username"}
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border p-2 rounded focus:ring-2 ring-advice-blue outline-none"
                placeholder={isAdminMode ? "Password" : "Password"}
                required 
              />
            </div>
            <button 
              type="submit" 
              className={`w-full text-white py-2 rounded font-bold transition ${isAdminMode ? 'bg-gray-800 hover:bg-black' : 'bg-advice-blue hover:bg-blue-700'}`}
            >
              {isAdminMode ? 'Login to Dashboard' : 'Login'}
            </button>
          </form>
          
          <div className="mt-6 text-center pt-4 border-t border-gray-100">
             <button 
               type="button"
               onClick={() => { setIsAdminMode(!isAdminMode); setUsername(''); setPassword(''); }}
               className="text-xs text-gray-500 underline hover:text-advice-blue"
             >
               Switch to {isAdminMode ? 'User' : 'Admin'} Login
             </button>
          </div>
       </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [taxRate, setTaxRate] = useState<number>(7); // Default VAT 7%
  
  // State for category filtering (Lifted up from Home)
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Load from local storage if available (omitted for brevity, using state)

  const handleLoginCheck = (u: string, p: string, isAdmin: boolean) => {
    if (isAdmin) {
      // STRICT CHECK for Admin
      if (u === 'admin' && p === 'Chopkeeper') {
        setUser(mockAdmin);
        window.location.hash = '/admin/dashboard';
      } else {
        alert("Access Denied: Invalid Admin Credentials.");
      }
    } else {
      // Simulation for User (Any input works for demo)
      if (u.trim() !== "") {
         setUser({ ...mockUser, name: u });
         window.location.hash = '/';
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCart([]);
    window.location.hash = '/';
  };

  const addToCart = (product: Product) => {
    if (!user) {
      alert("Please login to add items to cart.");
      window.location.hash = '/login';
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handlePlaceOrder = (items: CartItem[], total: number, breakdown: any) => {
    if (!user) return;
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      userId: user.id,
      items,
      subtotal: breakdown.subtotal,
      shippingTotal: breakdown.shipping,
      taxAmount: breakdown.tax,
      discountTotal: breakdown.discount,
      totalAmount: total,
      appliedCoupons: breakdown.appliedCoupons,
      status: 'verified',
      paymentMethod: 'promptpay',
      timestamp: Date.now()
    };
    setOrders(prev => [...prev, newOrder]);
  };

  const handleAddProduct = (newProduct: Product) => {
     setProducts(prev => [...prev, newProduct]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
     setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleDeleteProduct = (id: string) => {
     setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Handler for category selection from Navbar or Home
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    // If not on home page, go to home page
    if (window.location.hash !== '#/') {
       window.location.hash = '/';
    }
  };

  const handleNavigate = (path: string) => {
    window.location.hash = path;
    if (path === '/') {
        setSelectedCategory('All'); // Reset filter when clicking Logo
    }
  };

  return (
    <Router>
      <div 
        className="min-h-screen flex flex-col font-sans bg-cover bg-center bg-fixed bg-no-repeat"
        style={{
          // คุณสามารถเปลี่ยน URL ตรงนี้เป็นลิ้งค์รูปภาพที่คุณต้องการ
          backgroundImage: "url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')",
          // หรือใช้เป็น linear-gradient ก็ได้ เช่น:
          // backgroundImage: "linear-gradient(to bottom right, #e0e7ff, #f3f4f6)" 
        }}
      >
        <Navbar 
          user={user} 
          cartCount={cart.reduce((a, c) => a + c.quantity, 0)} 
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          onCategoryClick={handleCategorySelect}
        />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={
              <Home 
                products={products} 
                onAddToCart={addToCart} 
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategorySelect}
              />
            } />
            
            <Route path="/product/:id" element={
              <ProductDetail 
                products={products}
                onAddToCart={addToCart}
              />
            } />

            <Route path="/cart" element={
              <div className="container mx-auto p-4">
                 <div className="bg-white/90 p-6 rounded-lg shadow-lg backdrop-blur-sm">
                   <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
                   {cart.length === 0 ? <p>Cart is empty</p> : (
                      <div>
                        {cart.map(item => (
                          <div key={item.id} className="flex justify-between items-center bg-white p-4 mb-2 shadow-sm border border-gray-100">
                             <div>{item.name} (x{item.quantity})</div>
                             <div className="font-bold text-red-600">฿{(item.price * item.quantity).toLocaleString()}</div>
                          </div>
                        ))}
                        <button 
                          onClick={() => window.location.hash = '/checkout'}
                          className="mt-4 bg-advice-blue text-white px-6 py-2 rounded font-bold"
                        >
                          Proceed to Checkout
                        </button>
                      </div>
                   )}
                 </div>
              </div>
            } />

            <Route path="/checkout" element={
              user ? (
                <Checkout 
                  cart={cart} 
                  user={user} 
                  onPlaceOrder={handlePlaceOrder} 
                  clearCart={() => setCart([])}
                  taxRate={taxRate}
                />
              ) : <Navigate to="/login" />
            } />

            <Route path="/login" element={
              <LoginForm onLogin={handleLoginCheck} />
            } />

            <Route path="/register" element={
              <div className="flex flex-col items-center justify-center h-[80vh]">
                 <div className="bg-white/95 backdrop-blur-sm p-8 rounded shadow-lg w-96 text-center">
                    <h2 className="text-2xl font-bold mb-4">Register</h2>
                    <p className="text-gray-500 mb-4">Simulated Registration</p>
                    <button onClick={() => handleLoginCheck('New User', 'password', false)} className="bg-advice-orange text-white px-6 py-2 rounded font-bold">Create Account</button>
                 </div>
              </div>
            } />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
               user?.role === 'admin' ? (
                 <AdminDashboard 
                   orders={orders} 
                   products={products}
                   taxRate={taxRate}
                   onUpdateTaxRate={setTaxRate}
                 /> 
               ) : <Navigate to="/" />
            } />
            
            <Route path="/admin/products" element={
               user?.role === 'admin' ? (
                 <AdminProducts 
                   products={products} 
                   onAddProduct={handleAddProduct} 
                   onUpdateProduct={handleUpdateProduct}
                   onDeleteProduct={handleDeleteProduct}
                 />
               ) : <Navigate to="/" />
            } />
          </Routes>
        </main>
        
        {/* Simple Admin Sidebar (Floating for demo) if admin */}
        {user?.role === 'admin' && (
           <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
              <button 
                onClick={() => window.location.hash = '/admin/dashboard'}
                className="bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 tooltip"
                title="Dashboard"
              >
                📊
              </button>
              <button 
                onClick={() => window.location.hash = '/admin/products'}
                className="bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 tooltip"
                title="Manage Products"
              >
                📦
              </button>
           </div>
        )}

        <footer className="bg-white/90 border-t mt-10 py-10 backdrop-blur-sm">
           <div className="container mx-auto text-center text-gray-500 text-sm">
              <p>&copy; 2023 Advice-Like Clone. All rights reserved.</p>
              <p className="mt-2">Payment Verification System | PromptPay Integration</p>
           </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;