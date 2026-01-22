import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import Checkout from './pages/Checkout';
import { Product, User, CartItem, Order } from './types';
import { api } from './services/api';

// Login Component
const LoginForm: React.FC<{ onLogin: (u: string, p: string, isAdmin: boolean) => Promise<void> }> = ({ onLogin }) => {
  const [username, setUsername] = useState(''); // Treating as email
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // For register
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
        if (isRegistering) {
            await api.register(name, username, password);
            alert("Registration successful! Please login.");
            setIsRegistering(false);
        } else {
            // Check for admin legacy hardcode bypass or normal login
            await onLogin(username, password, false);
        }
    } catch (err) {
        setError("Operation failed. Please check credentials.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[80vh]">
       <div className="bg-white/95 backdrop-blur-sm p-8 rounded shadow-lg w-96">
          <h2 className="text-2xl font-bold mb-6 text-center text-advice-blue">
            {isRegistering ? 'Register Member' : 'System Login'}
          </h2>
          {error && <div className="bg-red-100 text-red-600 p-2 mb-4 rounded text-sm text-center">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Display Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border p-2 rounded focus:ring-2 ring-advice-blue outline-none"
                    required 
                  />
                </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email / Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border p-2 rounded focus:ring-2 ring-advice-blue outline-none"
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
                required 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full text-white py-2 rounded font-bold transition bg-advice-blue hover:bg-blue-700 ${loading ? 'opacity-50' : ''}`}
            >
              {loading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Login')}
            </button>
          </form>
          
          <div className="mt-6 text-center pt-4 border-t border-gray-100">
             <button 
               type="button"
               onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
               className="text-xs text-gray-500 underline hover:text-advice-blue"
             >
               {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
             </button>
          </div>
       </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [taxRate, setTaxRate] = useState<number>(7);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  // Initialize App
  useEffect(() => {
    const init = async () => {
        try {
            // Fetch Products
            const prodData = await api.getProducts();
            setProducts(prodData);

            // Check Auth
            if (localStorage.getItem('token')) {
                const userData = await api.getCurrentUser();
                setUser(userData);
                
                // Fetch Orders if user is logged in
                const orderData = await api.getOrders();
                setOrders(orderData);
            }
        } catch (e) {
            console.error("Initialization error:", e);
            // Don't clear token immediately on product fetch fail, but maybe on auth fail
        } finally {
            setLoading(false);
        }
    };
    init();
  }, []);

  // Fetch orders whenever user changes (login)
  useEffect(() => {
    if (user) {
        api.getOrders().then(setOrders).catch(console.error);
    }
  }, [user]);

  const handleLogin = async (u: string, p: string, isAdmin: boolean) => {
    // Note: isAdmin param is largely ignored here as API decides role
    const data = await api.login(u, p);
    localStorage.setItem('token', data.token);
    setUser({ ...data.user, isAuthenticated: true });
    
    // Redirect logic
    if (data.user.role === 'admin') {
        window.location.hash = '/admin/dashboard';
    } else {
        window.location.hash = '/';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCart([]);
    setOrders([]);
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

  const handlePlaceOrder = async (items: CartItem[], total: number, breakdown: any) => {
    if (!user) return;
    try {
        const orderPayload: Partial<Order> = {
            items: items.map(i => ({
                ...i,
                productId: i.id,
            })),
            subtotal: breakdown.subtotal,
            shippingTotal: breakdown.shipping,
            taxAmount: breakdown.tax,
            discountTotal: breakdown.discount,
            totalAmount: total,
            appliedCoupons: breakdown.appliedCoupons,
            status: 'verified',
            paymentMethod: 'promptpay'
        };

        const newOrder = await api.createOrder(orderPayload);
        setOrders(prev => [newOrder, ...prev]);
        return newOrder;
    } catch (e) {
        console.error("Failed to place order", e);
        alert("Failed to place order. Please try again.");
    }
  };

  const handleAddProduct = async (newProduct: Product) => {
     try {
         // Exclude ID so DB generates it
         const { id, ...prodData } = newProduct; 
         const saved = await api.addProduct(prodData);
         setProducts(prev => [...prev, saved]);
     } catch (e) {
         alert("Failed to add product");
     }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
     try {
         const saved = await api.updateProduct(updatedProduct);
         setProducts(prev => prev.map(p => p.id === saved.id ? saved : p));
     } catch (e) {
         alert("Failed to update product");
     }
  };

  const handleDeleteProduct = async (id: string) => {
     if(!window.confirm("Are you sure?")) return;
     try {
         await api.deleteProduct(id);
         setProducts(prev => prev.filter(p => p.id !== id));
     } catch (e) {
         alert("Failed to delete product");
     }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    if (window.location.hash !== '#/') {
       window.location.hash = '/';
    }
  };

  const handleNavigate = (path: string) => {
    window.location.hash = path;
    if (path === '/') setSelectedCategory('All');
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading IT Shop...</div>;

  return (
    <Router>
      <div 
        className="min-h-screen flex flex-col font-sans bg-cover bg-center bg-fixed bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')",
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
              <LoginForm onLogin={handleLogin} />
            } />

            <Route path="/register" element={
               <Navigate to="/login" /> 
               // Register is now part of Login component toggle
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