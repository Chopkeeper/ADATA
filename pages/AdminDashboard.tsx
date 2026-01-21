import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { Order, Coupon, Product } from '../types';
import { INITIAL_COUPONS } from '../services/mockData';
import { Database, Server, ShieldCheck, CheckCircle2, Ticket, AlertTriangle, Check, Search, Plus, Eye, X, Settings, TrendingUp, Package } from 'lucide-react';

interface AdminDashboardProps {
  orders: Order[];
  products: Product[];
  taxRate: number;
  onUpdateTaxRate: (rate: number) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ orders, products, taxRate, onUpdateTaxRate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'promotions'>('overview');
  
  // -- Orders State --
  const [localOrders, setLocalOrders] = useState<Order[]>(orders);
  
  // Order Detail View State
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  // Issue Reporting State
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [issueNote, setIssueNote] = useState('');

  // -- Promotions State --
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({ type: 'fixed', value: 0 });

  // -- Settings State (Local) --
  const [editingTax, setEditingTax] = useState(taxRate);

  // --- ANALYTICS DATA PREPARATION ---

  // 1. Sales by Category (Pie Chart)
  const salesByCategoryData = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    localOrders.forEach(order => {
      if (order.status !== 'pending') { // Only count paid/valid orders
        order.items.forEach(item => {
          const total = (item.price - (item.price * item.discountPercent / 100)) * item.quantity;
          categoryMap[item.category] = (categoryMap[item.category] || 0) + total;
        });
      }
    });
    
    // Fallback Mock Data if empty
    if (Object.keys(categoryMap).length === 0) {
        return [
            { name: 'Notebook', value: 550000 },
            { name: 'DIY', value: 300000 },
            { name: 'Monitor', value: 150000 },
            { name: 'Accessories', value: 50000 },
        ];
    }

    return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  }, [localOrders]);

  // 1.5 Stock by Category (Pie Chart) - Based on current inventory
  const stockByCategoryData = useMemo(() => {
    const stockMap: Record<string, number> = {};
    products.forEach(p => {
        stockMap[p.category] = (stockMap[p.category] || 0) + p.stock;
    });
    
    return Object.entries(stockMap).map(([name, value]) => ({ name, value }));
  }, [products]);

  // 2. Monthly Revenue (Area Chart)
  const monthlyRevenueData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const data = months.map(m => ({ name: m, revenue: 0 }));
    
    localOrders.forEach(order => {
        if (order.status !== 'pending') {
            const date = new Date(order.timestamp);
            const monthIdx = date.getMonth();
            data[monthIdx].revenue += order.totalAmount;
        }
    });

    // Mock Boost if empty
    if (data.every(d => d.revenue === 0)) {
        data[0].revenue = 120000; data[1].revenue = 150000; data[2].revenue = 180000;
        data[9].revenue = 200000; data[10].revenue = 250000; data[11].revenue = 320000;
    }
    return data;
  }, [localOrders]);

  // 3. Quarterly Revenue (Bar Chart)
  const quarterlyRevenueData = useMemo(() => {
    const data = [
      { name: 'Q1', revenue: 0 }, { name: 'Q2', revenue: 0 },
      { name: 'Q3', revenue: 0 }, { name: 'Q4', revenue: 0 },
    ];
    localOrders.forEach(order => {
      if (order.status !== 'pending') {
          const q = Math.floor(new Date(order.timestamp).getMonth() / 3);
          data[q].revenue += order.totalAmount;
      }
    });
    // Mock Boost
    if (data.every(d => d.revenue === 0)) {
        data[0].revenue = 450000; data[1].revenue = 520000; 
        data[2].revenue = 680000; data[3].revenue = 800000;
    }
    return data;
  }, [localOrders]);

  // 4. Yearly Revenue (Bar Chart)
  const yearlyRevenueData = useMemo(() => {
    const yearMap: Record<string, number> = {};
    localOrders.forEach(order => {
        if (order.status !== 'pending') {
            const year = new Date(order.timestamp).getFullYear().toString();
            yearMap[year] = (yearMap[year] || 0) + order.totalAmount;
        }
    });

    // Ensure at least current year and last year exist for visual
    const currentYear = new Date().getFullYear();
    if (!yearMap[currentYear]) yearMap[currentYear] = 0;
    if (!yearMap[currentYear - 1]) yearMap[currentYear - 1] = 0;

    // Mock boost
    if (Object.values(yearMap).every(v => v === 0)) {
        yearMap['2022'] = 2500000;
        yearMap['2023'] = 3200000;
    }

    return Object.entries(yearMap).map(([name, revenue]) => ({ name, revenue })).sort((a,b) => a.name.localeCompare(b.name));
  }, [localOrders]);


  // Order Actions
  const handleVerifyOrder = (id: string) => {
    setLocalOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'shipped' } : o));
    alert(`Order ${id} verified and marked as shipped.`);
  };

  const openIssueModal = (id: string) => {
    setSelectedOrderId(id);
    setIssueNote('');
    setIssueModalOpen(true);
  };

  const submitIssue = () => {
    if (selectedOrderId) {
        setLocalOrders(prev => prev.map(o => o.id === selectedOrderId ? { 
            ...o, 
            status: 'issue_reported',
            adminNote: issueNote 
        } : o));
        setIssueModalOpen(false);
        alert("Issue reported for order.");
    }
  };

  // Coupon Actions
  const handleAddCoupon = () => {
     if (!newCoupon.code || !newCoupon.value) return;
     const coupon: Coupon = {
         id: Date.now().toString(),
         code: newCoupon.code.toUpperCase(),
         type: newCoupon.type as any,
         value: Number(newCoupon.value),
         isActive: true
     };
     setCoupons([...coupons, coupon]);
     setNewCoupon({ type: 'fixed', value: 0, code: '' });
  };

  const toggleCoupon = (id: string) => {
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  // Setting Action
  const handleSaveTax = () => {
      onUpdateTaxRate(editingTax);
      alert("System tax rate updated successfully!");
  }

  return (
    <div className="p-6 bg-gray-50/90 min-h-screen">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-advice-darkBlue">Admin Dashboard</h1>
          <div className="flex space-x-2">
             <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded ${activeTab === 'overview' ? 'bg-advice-blue text-white' : 'bg-white'}`}>Overview</button>
             <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 rounded ${activeTab === 'orders' ? 'bg-advice-blue text-white' : 'bg-white'}`}>Orders</button>
             <button onClick={() => setActiveTab('promotions')} className={`px-4 py-2 rounded ${activeTab === 'promotions' ? 'bg-advice-blue text-white' : 'bg-white'}`}>Promotions</button>
          </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
            
            {/* Top Row: System & Config */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Server size={24} className="text-green-400"/> System Status</h2>
                    <div className="grid grid-cols-3 gap-2">
                         <div className="bg-gray-700 p-2 rounded text-center"><Database size={20} className="mx-auto mb-1"/><div className="text-xs">MongoDB</div></div>
                         <div className="bg-gray-700 p-2 rounded text-center"><ShieldCheck size={20} className="mx-auto mb-1"/><div className="text-xs">Secure</div></div>
                         <div className="bg-gray-700 p-2 rounded text-center"><CheckCircle2 size={20} className="mx-auto mb-1"/><div className="text-xs">Online</div></div>
                    </div>
                </div>

                <div className="bg-white text-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-advice-darkBlue">
                        <Settings size={24} className="text-advice-orange"/> System Configuration
                    </h2>
                    <div className="flex items-center gap-4 bg-gray-50 p-3 rounded">
                        <span className="text-sm font-bold">VAT Rate:</span>
                        <input 
                            type="number" 
                            value={editingTax}
                            onChange={(e) => setEditingTax(Number(e.target.value))}
                            className="w-20 border p-1 rounded font-mono font-bold text-center"
                        />
                        <button onClick={handleSaveTax} className="text-sm bg-advice-blue text-white px-3 py-1 rounded">Update</button>
                    </div>
                </div>
            </div>

            {/* Row 1: Pie Charts (Graph 1 & 1.5) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-700">
                        <TrendingUp className="text-blue-500"/> Sales by Category (Revenue)
                    </h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={salesByCategoryData} cx="50%" cy="50%" labelLine={false} label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                                    {salesByCategoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `฿${Number(value).toLocaleString()}`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-700">
                        <Package className="text-orange-500"/> Stock Inventory by Category
                    </h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={stockByCategoryData} cx="50%" cy="50%" labelLine={false} label={({name, value}) => `${name} (${value})`} outerRadius={80} fill="#82ca9d" dataKey="value">
                                    {stockByCategoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Row 2: Monthly Revenue (Graph 2) */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-bold mb-4 text-gray-700">Monthly Revenue</h2>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyRevenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => `฿${Number(value).toLocaleString()}`} />
                            <Area type="monotone" dataKey="revenue" stroke="#0056b3" fill="#007bff" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Row 3: Quarterly & Yearly (Graph 3 & 4) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-bold mb-4 text-gray-700">Quarterly Revenue</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={quarterlyRevenueData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => `฿${Number(value).toLocaleString()}`} />
                                <Bar dataKey="revenue" fill="#f89406" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-bold mb-4 text-gray-700">Yearly Revenue</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={yearlyRevenueData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => `฿${Number(value).toLocaleString()}`} />
                                <Bar dataKey="revenue" fill="#004494" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
             <div className="p-4 border-b bg-gray-100 font-bold flex justify-between">
                 <span>Recent Orders</span>
                 <span className="text-sm text-gray-500 font-normal">Total: {localOrders.length}</span>
             </div>
             <table className="w-full text-sm text-left">
                 <thead className="bg-gray-50 text-gray-700">
                     <tr>
                         <th className="p-4">Order ID</th>
                         <th className="p-4">Date</th>
                         <th className="p-4">Total (Inc. VAT)</th>
                         <th className="p-4">Coupons</th>
                         <th className="p-4">Status</th>
                         <th className="p-4">Issues/Notes</th>
                         <th className="p-4 text-right">Actions</th>
                     </tr>
                 </thead>
                 <tbody>
                     {localOrders.map(order => (
                         <tr key={order.id} className="border-b hover:bg-blue-50">
                             <td className="p-4 font-mono">{order.id}</td>
                             <td className="p-4">{new Date(order.timestamp).toLocaleDateString()}</td>
                             <td className="p-4 font-bold">฿{order.totalAmount.toLocaleString()}</td>
                             <td className="p-4">
                                 {order.appliedCoupons?.length ? order.appliedCoupons.join(', ') : '-'}
                             </td>
                             <td className="p-4">
                                 <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                    ${order.status === 'verified' || order.status === 'paid' ? 'bg-blue-100 text-blue-700' : 
                                      order.status === 'shipped' ? 'bg-green-100 text-green-700' :
                                      order.status === 'issue_reported' ? 'bg-red-100 text-red-700' : 'bg-gray-100'}`}>
                                    {order.status}
                                 </span>
                             </td>
                             <td className="p-4 text-red-600 italic">{order.adminNote || '-'}</td>
                             <td className="p-4 text-right space-x-2 flex justify-end">
                                 <button onClick={() => setViewOrder(order)} className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600" title="View Details"><Eye size={16}/></button>
                                 <button onClick={() => handleVerifyOrder(order.id)} className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600" title="Verify & Ship"><Check size={16}/></button>
                                 <button onClick={() => openIssueModal(order.id)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" title="Report Issue"><AlertTriangle size={16}/></button>
                             </td>
                         </tr>
                     ))}
                 </tbody>
             </table>
          </div>
      )}

      {/* PROMOTIONS TAB */}
      {activeTab === 'promotions' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Add Coupon Form */}
              <div className="bg-white p-6 rounded-lg shadow h-fit">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Plus size={20}/> Create Coupon</h2>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm text-gray-700">Code</label>
                          <input type="text" value={newCoupon.code || ''} onChange={e => setNewCoupon({...newCoupon, code: e.target.value})} className="w-full border p-2 rounded uppercase" placeholder="e.g. SUMMER50"/>
                      </div>
                      <div>
                          <label className="block text-sm text-gray-700">Type</label>
                          <select value={newCoupon.type} onChange={e => setNewCoupon({...newCoupon, type: e.target.value as any})} className="w-full border p-2 rounded">
                              <option value="fixed">Fixed Amount (THB)</option>
                              <option value="percent">Percentage (%)</option>
                              <option value="free_shipping">Free Shipping</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm text-gray-700">Value</label>
                          <input type="number" value={newCoupon.value} onChange={e => setNewCoupon({...newCoupon, value: Number(e.target.value)})} className="w-full border p-2 rounded" disabled={newCoupon.type === 'free_shipping'}/>
                      </div>
                      <button onClick={handleAddCoupon} className="w-full bg-advice-orange text-white py-2 rounded font-bold hover:bg-orange-600">Create Coupon</button>
                  </div>
              </div>

              {/* Coupon List */}
              <div className="md:col-span-2 bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-4 border-b bg-gray-100 font-bold">Active Promotions</div>
                  <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                          <tr>
                              <th className="p-3 text-left">Code</th>
                              <th className="p-3 text-left">Type</th>
                              <th className="p-3 text-left">Value</th>
                              <th className="p-3 text-center">Status</th>
                              <th className="p-3 text-center">Action</th>
                          </tr>
                      </thead>
                      <tbody>
                          {coupons.map(c => (
                              <tr key={c.id} className="border-b">
                                  <td className="p-3 font-bold">{c.code}</td>
                                  <td className="p-3 capitalize">{c.type.replace('_', ' ')}</td>
                                  <td className="p-3">{c.type === 'percent' ? `${c.value}%` : c.type === 'fixed' ? `฿${c.value}` : '-'}</td>
                                  <td className="p-3 text-center">
                                      <span className={`px-2 py-0.5 rounded text-xs ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                          {c.isActive ? 'Active' : 'Inactive'}
                                      </span>
                                  </td>
                                  <td className="p-3 text-center">
                                      <button onClick={() => toggleCoupon(c.id)} className="text-blue-500 hover:underline">
                                          {c.isActive ? 'Disable' : 'Enable'}
                                      </button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* VIEW ORDER DETAILS MODAL */}
      {viewOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Order #{viewOrder.id}</h3>
                      <p className="text-xs text-gray-500">Placed on {new Date(viewOrder.timestamp).toLocaleString()}</p>
                    </div>
                    <button onClick={() => setViewOrder(null)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={28}/></button>
                </div>
                
                <div className="p-6 overflow-y-auto bg-gray-50/50 flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
                            <h4 className="font-bold text-gray-700 mb-2 border-b pb-2">Customer & Status</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-gray-500">User ID:</span> <span>{viewOrder.userId}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Payment:</span> <span className="uppercase">{viewOrder.paymentMethod}</span></div>
                                <div className="flex justify-between items-center"><span className="text-gray-500">Status:</span> 
                                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase
                                      ${viewOrder.status === 'verified' || viewOrder.status === 'paid' ? 'bg-blue-100 text-blue-700' : 
                                        viewOrder.status === 'shipped' ? 'bg-green-100 text-green-700' :
                                        viewOrder.status === 'issue_reported' ? 'bg-red-100 text-red-700' : 'bg-gray-100'}`}>
                                      {viewOrder.status}
                                  </span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
                           <h4 className="font-bold text-gray-700 mb-2 border-b pb-2">Financials</h4>
                           <div className="space-y-1 text-sm">
                                <div className="flex justify-between"><span>Subtotal:</span> <span>฿{viewOrder.subtotal?.toLocaleString() ?? 0}</span></div>
                                <div className="flex justify-between text-green-600"><span>Discount:</span> <span>-฿{viewOrder.discountTotal?.toLocaleString() ?? 0}</span></div>
                                <div className="flex justify-between text-gray-600"><span>VAT ({((viewOrder.taxAmount / Math.max(viewOrder.subtotal - viewOrder.discountTotal, 1)) * 100).toFixed(0)}%):</span> <span>฿{viewOrder.taxAmount?.toLocaleString() ?? 0}</span></div>
                                <div className="flex justify-between text-gray-600"><span>Shipping:</span> <span>฿{viewOrder.shippingTotal?.toLocaleString() ?? 0}</span></div>
                                <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-gray-100"><span>Total:</span> <span className="text-advice-blue">฿{viewOrder.totalAmount?.toLocaleString()}</span></div>
                           </div>
                        </div>
                    </div>

                    <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden mb-6">
                        <div className="bg-gray-100 px-4 py-2 font-bold text-sm text-gray-700">Order Items</div>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500 border-b">
                                <tr>
                                    <th className="p-3 text-left">Product Name</th>
                                    <th className="p-3 text-right">Unit Price</th>
                                    <th className="p-3 text-center">Qty</th>
                                    <th className="p-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {viewOrder.items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="p-3">{item.name}</td>
                                        <td className="p-3 text-right">฿{item.price.toLocaleString()}</td>
                                        <td className="p-3 text-center">{item.quantity}</td>
                                        <td className="p-3 text-right font-medium">฿{(item.price * item.quantity).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {viewOrder.adminNote && (
                        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
                            <h4 className="font-bold text-red-800 flex items-center gap-2"><AlertTriangle size={18}/> Issue Reported</h4>
                            <p className="text-red-700 mt-1">{viewOrder.adminNote}</p>
                        </div>
                    )}

                    {viewOrder.appliedCoupons && viewOrder.appliedCoupons.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded p-4">
                            <h4 className="font-bold text-green-800 flex items-center gap-2"><Ticket size={18}/> Applied Coupons</h4>
                            <div className="flex gap-2 mt-2">
                                {viewOrder.appliedCoupons.map(code => (
                                    <span key={code} className="bg-white border border-green-300 text-green-700 px-2 py-1 rounded text-xs font-bold shadow-sm">{code}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="p-4 bg-white border-t flex justify-end gap-2">
                    <button onClick={() => setViewOrder(null)} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded font-bold text-gray-700 transition-colors">Close</button>
                </div>
            </div>
        </div>
      )}

      {/* ISSUE MODAL */}
      {issueModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded shadow-lg w-96">
                  <h3 className="text-lg font-bold mb-4 text-red-600">Report Issue</h3>
                  <textarea 
                    value={issueNote} 
                    onChange={e => setIssueNote(e.target.value)}
                    className="w-full border p-2 rounded h-32 mb-4" 
                    placeholder="Describe the issue (e.g., Damaged item, Wrong color)..."
                  ></textarea>
                  <div className="flex justify-end gap-2">
                      <button onClick={() => setIssueModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                      <button onClick={submitIssue} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Submit Report</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;