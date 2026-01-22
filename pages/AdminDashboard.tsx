import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line
} from 'recharts';
import { Order, Coupon, Product } from '../types';
import { INITIAL_COUPONS } from '../services/mockData';
import { 
  Server, Database, ShieldCheck, CheckCircle2, Ticket, AlertTriangle, Check, Search, Plus, Eye, X, Settings, 
  TrendingUp, Package, Users, Facebook, Twitter, Youtube, DollarSign, Truck, Clock, MoreHorizontal, Calendar, Layers
} from 'lucide-react';

interface AdminDashboardProps {
  orders: Order[];
  products: Product[];
  taxRate: number;
  onUpdateTaxRate: (rate: number) => void;
}

// Design Palette
const THEME = {
  bg: '#1e1e2f',
  card: '#27293d',
  textMain: '#ffffff',
  textMuted: '#9a9a9a',
  blue: '#1d8cf8',
  green: '#00f2c3',
  pink: '#e14eca',
  orange: '#ff8d72',
  purple: '#fd5d93',
  chartColors: ['#00f2c3', '#1d8cf8', '#e14eca', '#ff8d72', '#fd5d93']
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ orders, products, taxRate, onUpdateTaxRate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'promotions'>('overview');
  
  // -- Orders State --
  const [localOrders, setLocalOrders] = useState<Order[]>(orders);
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

  // --- ANALYTICS DATA ---

  // Total Revenue
  const totalRevenue = useMemo(() => {
    return localOrders.reduce((acc, order) => order.status !== 'pending' ? acc + order.totalAmount : acc, 0);
  }, [localOrders]);

  // Graph 1: Sales by Category (Pie Chart)
  const salesByCategoryData = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    localOrders.forEach(order => {
      if (order.status !== 'pending') {
        order.items.forEach(item => {
          const total = (item.price - (item.price * item.discountPercent / 100)) * item.quantity;
          categoryMap[item.category] = (categoryMap[item.category] || 0) + total;
        });
      }
    });
    
    // Fallback Mock Data for UI Visualization if empty
    if (Object.keys(categoryMap).length === 0) {
        return [
            { name: 'Electronics', value: 22 },
            { name: 'Apparels', value: 37 },
            { name: 'TableWare', value: 30 },
            { name: 'Healthcare', value: 18 },
            { name: 'Pet Supplies', value: 18 },
        ];
    }
    return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  }, [localOrders]);

  // Graph 1.5: Stock by Category (Pie Chart)
  const stockByCategoryData = useMemo(() => {
    const stockMap: Record<string, number> = {};
    products.forEach(p => {
        stockMap[p.category] = (stockMap[p.category] || 0) + p.stock;
    });

    // Fallback Mock if products empty
    if (Object.keys(stockMap).length === 0) {
        return [
            { name: 'Notebook', value: 50 },
            { name: 'Monitor', value: 20 },
            { name: 'CPU', value: 15 },
            { name: 'VGA', value: 10 },
            { name: 'RAM', value: 40 },
        ];
    }
    return Object.entries(stockMap).map(([name, value]) => ({ name, value }));
  }, [products]);

  // Graph 2: Monthly Revenue (Bar Chart)
  const monthlyRevenueData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const data = months.map((m, i) => ({ name: m, revenue: 0, pv: Math.floor(Math.random() * 50) + 10 })); // pv is mock for second bar
    
    localOrders.forEach(order => {
        if (order.status !== 'pending') {
            const date = new Date(order.timestamp);
            const monthIdx = date.getMonth();
            data[monthIdx].revenue += order.totalAmount;
        }
    });

    // Mock Boost to match the visual density of the chart
    if (data.every(d => d.revenue === 0)) {
        return data.map(d => ({ ...d, revenue: Math.floor(Math.random() * 40000) + 5000 }));
    }
    return data;
  }, [localOrders]);

  // Graph 3: Quarterly Revenue (Bar Chart)
  const quarterlyRevenueData = useMemo(() => {
      const data = [
        { name: 'Q1', revenue: 0 }, { name: 'Q2', revenue: 0 },
        { name: 'Q3', revenue: 0 }, { name: 'Q4', revenue: 0 }
      ];
      localOrders.forEach(order => {
        if (order.status !== 'pending') {
          const month = new Date(order.timestamp).getMonth();
          const q = Math.floor(month / 3);
          data[q].revenue += order.totalAmount;
        }
      });
      // Mock data if empty
      if (data.every(d => d.revenue === 0)) {
         return [
             { name: 'Q1', revenue: 145000 }, { name: 'Q2', revenue: 252000 },
             { name: 'Q3', revenue: 138000 }, { name: 'Q4', revenue: 364000 }
         ]
      }
      return data;
  }, [localOrders]);

  // Graph 4: Yearly Revenue (Bar Chart)
  const yearlyRevenueData = useMemo(() => {
    const yearMap: Record<string, number> = {};
    localOrders.forEach(order => {
        if (order.status !== 'pending') {
            const year = new Date(order.timestamp).getFullYear();
            yearMap[year] = (yearMap[year] || 0) + order.totalAmount;
        }
    });
    // Mock
    if (Object.keys(yearMap).length === 0) {
        return [
            { name: '2021', revenue: 150000 },
            { name: '2022', revenue: 430000 },
            { name: '2023', revenue: 890000 }
        ];
    }
    return Object.entries(yearMap).map(([name, revenue]) => ({ name, revenue })).sort((a,b) => a.name.localeCompare(b.name));
  }, [localOrders]);

  // Trend Data for Users line chart
  const trendData = useMemo(() => {
     return Array.from({ length: 10 }, (_, i) => ({
        name: i.toString(),
        value: Math.floor(Math.random() * 100) + 50
     }));
  }, []);

  // Top Products
  const topProducts = useMemo(() => {
     const prodMap: Record<string, number> = {};
     localOrders.forEach(o => o.items.forEach(i => {
         prodMap[i.name] = (prodMap[i.name] || 0) + i.quantity;
     }));
     // Mock if empty
     if (Object.keys(prodMap).length === 0) {
        return [
            { name: 'Notebook ASUS', value: 150, color: '#00f2c3' },
            { name: 'RTX 4060', value: 120, color: '#e14eca' },
            { name: 'Monitor LG', value: 90, color: '#1d8cf8' },
            { name: 'Kingston RAM', value: 85, color: '#ff8d72' },
            { name: 'Logitech Mouse', value: 60, color: '#fd5d93' },
        ];
     }
     return Object.entries(prodMap)
        .map(([name, value], idx) => ({ name, value, color: THEME.chartColors[idx % THEME.chartColors.length] }))
        .sort((a,b) => b.value - a.value)
        .slice(0, 5);
  }, [localOrders]);

  // Actions
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

  const handleSaveTax = () => {
      onUpdateTaxRate(editingTax);
      alert("System tax rate updated successfully!");
  }

  // Common Card Component
  const DashboardCard = ({ children, title, className = "" }: { children?: React.ReactNode, title?: string, className?: string }) => (
    <div className={`rounded-xl p-5 shadow-lg relative flex flex-col ${className}`} style={{ backgroundColor: THEME.card }}>
       {title && <h3 className="text-gray-400 text-sm font-light mb-4 flex items-center gap-2">{title}</h3>}
       {children}
    </div>
  );

  return (
    <div className="min-h-screen p-6 font-sans transition-colors duration-300" style={{ backgroundColor: THEME.bg, color: THEME.textMain }}>
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-wider">DASHBOARD</h1>
            <p className="text-sm text-gray-400">Real-time performance monitor</p>
          </div>
          
          <div className="bg-[#27293d] p-1 rounded-lg flex">
             {['overview', 'orders', 'promotions'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-300 capitalize
                    ${activeTab === tab 
                        ? 'bg-[#1d8cf8] text-white shadow-lg shadow-blue-500/30' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  {tab}
                </button>
             ))}
          </div>
      </div>

      {/* OVERVIEW CONTENT */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Row 1: Key Metrics & Pie Charts (Graph 1 & Graph 1.5) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Revenue */}
                <DashboardCard className="relative overflow-hidden group">
                   <div className="flex justify-between items-start z-10">
                      <div>
                         <h3 className="text-gray-400 text-sm mb-1">Total Revenue</h3>
                         <div className="text-3xl font-bold text-white flex items-baseline">
                            <span className="text-lg mr-1">฿</span>
                            {totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })} 
                         </div>
                      </div>
                      <div className="bg-[#1d8cf8]/20 p-3 rounded-full text-[#1d8cf8]">
                         <DollarSign size={24} />
                      </div>
                   </div>
                   <div className="mt-4 text-sm text-gray-400 flex items-center gap-2">
                      <Clock size={14} className="text-[#1d8cf8]"/> Latest Update
                   </div>
                   <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#1d8cf8]/10 rounded-full blur-2xl group-hover:bg-[#1d8cf8]/20 transition-all"></div>
                </DashboardCard>

                {/* Graph 1: Sales by Category */}
                <DashboardCard title="Sales by Category">
                   <div className="h-48 relative">
                      <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                            <Pie 
                               data={salesByCategoryData} 
                               innerRadius={50} 
                               outerRadius={70} 
                               paddingAngle={5}
                               dataKey="value"
                               stroke="none"
                            >
                               {salesByCategoryData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={THEME.chartColors[index % THEME.chartColors.length]} />
                               ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: THEME.card, borderColor: '#333', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#fff' }} formatter={(val) => `฿${Number(val).toLocaleString()}`} />
                         </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-xs text-gray-400">Total</span>
                          <span className="text-xl font-bold">Sales</span>
                      </div>
                   </div>
                   <div className="text-center text-xs text-gray-400 mt-2">Revenue Breakup</div>
                </DashboardCard>

                {/* Graph 1.5: Stock by Category */}
                <DashboardCard title="Stock Inventory">
                   <div className="h-48 relative">
                      <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                            <Pie 
                               data={stockByCategoryData} 
                               innerRadius={50} 
                               outerRadius={70} 
                               paddingAngle={5}
                               dataKey="value"
                               stroke="none"
                            >
                               {stockByCategoryData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={THEME.chartColors[(index + 2) % THEME.chartColors.length]} />
                               ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: THEME.card, borderColor: '#333', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                         </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-xs text-gray-400">Total</span>
                          <span className="text-xl font-bold">Items</span>
                      </div>
                   </div>
                   <div className="text-center text-xs text-gray-400 mt-2">Stock Breakup</div>
                </DashboardCard>

                 {/* Total Users */}
                <DashboardCard className="justify-between">
                   <div>
                       <h3 className="text-gray-400 text-sm mb-2">Total Users</h3>
                       <div className="text-4xl font-bold text-[#00f2c3]">432,168</div>
                   </div>
                   <div className="mt-6">
                      <h4 className="text-gray-400 text-xs mb-2">User Growth</h4>
                      <div className="h-12 w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                               <Line type="monotone" dataKey="value" stroke="#00f2c3" strokeWidth={2} dot={false} />
                            </LineChart>
                         </ResponsiveContainer>
                      </div>
                   </div>
                </DashboardCard>
            </div>

            {/* Row 2: Time-based Revenue (Graph 2, 3, 4) */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Graph 2: Revenue by Month (Wide) */}
                <DashboardCard title="Revenue by Month (Graph 2)" className="lg:col-span-2">
                   <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={monthlyRevenueData} barCategoryGap={20}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                            <XAxis dataKey="name" tick={{fill: '#9a9a9a', fontSize: 10}} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{fill: '#ffffff05'}} contentStyle={{ backgroundColor: THEME.card, border: 'none', borderRadius: '8px' }} />
                            <Bar dataKey="revenue" fill={THEME.green} radius={[4, 4, 0, 0]} barSize={10} name="Revenue" />
                         </BarChart>
                      </ResponsiveContainer>
                   </div>
                </DashboardCard>

                {/* Graph 3: Quarterly Revenue */}
                <DashboardCard title="Quarterly Revenue (Graph 3)">
                   <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={quarterlyRevenueData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ffffff10" />
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" tick={{fill: '#fff'}} width={30} />
                            <Tooltip cursor={{fill: '#ffffff05'}} contentStyle={{ backgroundColor: THEME.card, border: 'none', borderRadius: '8px' }} formatter={(val) => `฿${Number(val).toLocaleString()}`} />
                            <Bar dataKey="revenue" fill={THEME.orange} radius={[0, 4, 4, 0]} barSize={20} name="Revenue" />
                         </BarChart>
                      </ResponsiveContainer>
                   </div>
                </DashboardCard>

                 {/* Graph 4: Yearly Revenue */}
                 <DashboardCard title="Yearly Revenue (Graph 4)">
                   <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={yearlyRevenueData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                            <XAxis dataKey="name" tick={{fill: '#9a9a9a', fontSize: 10}} axisLine={false} />
                            <Tooltip cursor={{fill: '#ffffff05'}} contentStyle={{ backgroundColor: THEME.card, border: 'none', borderRadius: '8px' }} formatter={(val) => `฿${Number(val).toLocaleString()}`} />
                            <Bar dataKey="revenue" fill={THEME.purple} radius={[4, 4, 0, 0]} barSize={30} name="Revenue" />
                         </BarChart>
                      </ResponsiveContainer>
                   </div>
                </DashboardCard>
            </div>

            {/* Row 3: Trends, Top Selling & Status */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Line Chart */}
                <DashboardCard className="lg:col-span-2">
                   <div className="flex justify-between items-center mb-4">
                      <h3 className="text-gray-400 text-sm">Revenue Trends (Area)</h3>
                      <div className="bg-[#1d8cf8]/10 text-[#1d8cf8] text-xs px-3 py-1 rounded-full">Growth +12%</div>
                   </div>
                   <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={monthlyRevenueData}>
                            <defs>
                               <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#1d8cf8" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#1d8cf8" stopOpacity={0}/>
                               </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                            <Tooltip contentStyle={{ backgroundColor: THEME.card, border: 'none', color: '#fff' }} />
                            <Area type="monotone" dataKey="revenue" stroke="#1d8cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </DashboardCard>
                
                {/* Top Selling Categories */}
                <DashboardCard title="Top Selling Items">
                   <div className="space-y-4 overflow-y-auto max-h-60 pr-2 custom-scrollbar">
                      {topProducts.map((p, idx) => (
                         <div key={idx}>
                            <div className="flex justify-between text-xs mb-1">
                               <span className="flex items-center gap-2">
                                  {idx === 0 ? '🏆' : '📦'} {p.name}
                               </span>
                               <span className="text-gray-400">{p.value} units</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-1.5">
                               <div 
                                 className="h-1.5 rounded-full" 
                                 style={{ width: `${Math.min((p.value / 150) * 100, 100)}%`, backgroundColor: p.color }}
                               ></div>
                            </div>
                         </div>
                      ))}
                   </div>
                </DashboardCard>

                {/* Orders by Status */}
                <DashboardCard title="Orders by Status">
                   <div className="space-y-3 mt-2 overflow-y-auto max-h-64 custom-scrollbar pr-2">
                      {localOrders.slice(0, 5).map((order) => (
                         <div key={order.id} className="flex justify-between items-center text-sm py-2 border-b border-white/5 last:border-0">
                            <span className="text-gray-300 font-mono text-xs">{order.id.slice(0,12)}...</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize w-20 text-center
                               ${order.status === 'pending' ? 'bg-gray-700 text-gray-300' : 
                                 order.status === 'paid' ? 'bg-[#ff8d72]/20 text-[#ff8d72]' :
                                 order.status === 'verified' ? 'bg-[#1d8cf8]/20 text-[#1d8cf8]' :
                                 order.status === 'shipped' ? 'bg-[#00f2c3]/20 text-[#00f2c3]' :
                                 'bg-[#fd5d93]/20 text-[#fd5d93]'}`}>
                               {order.status}
                            </span>
                         </div>
                      ))}
                   </div>
                   <div className="mt-auto pt-4 grid grid-cols-2 gap-3">
                       <div className="bg-[#1d8cf8] h-16 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/40 cursor-pointer hover:scale-105 transition-transform">
                          <CheckCircle2 size={24} />
                       </div>
                       <div className="bg-[#2b2d42] h-16 rounded-xl flex items-center justify-center text-white border border-white/10 hover:bg-[#343650] transition-colors cursor-pointer">
                          <Settings size={24} />
                       </div>
                   </div>
                </DashboardCard>

            </div>

             {/* Row 4: Config & Social */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard className="space-y-2 lg:col-span-1">
                   <h3 className="text-gray-400 text-sm">Social</h3>
                   <div className="flex gap-2">
                         <div className="flex-1 p-2 bg-[#3b5998] rounded text-white flex justify-center"><Facebook size={16}/></div>
                         <div className="flex-1 p-2 bg-[#1da1f2] rounded text-white flex justify-center"><Twitter size={16}/></div>
                         <div className="flex-1 p-2 bg-[#ff0000] rounded text-white flex justify-center"><Youtube size={16}/></div>
                   </div>
                </DashboardCard>

                <DashboardCard title="System Config" className="lg:col-span-3 border border-[#1d8cf8]/30">
                     <div className="flex flex-col md:flex-row items-center gap-4">
                         <div className="p-3 bg-white/5 rounded-lg border border-white/10 flex-1 w-full">
                            <h4 className="text-sm font-bold text-white mb-1">VAT Rate</h4>
                            <div className="flex gap-2">
                               <input 
                                  type="number" 
                                  value={editingTax}
                                  onChange={(e) => setEditingTax(Number(e.target.value))}
                                  className="w-full bg-[#1e1e2f] border border-gray-600 rounded px-3 py-1 text-white text-sm focus:border-[#1d8cf8] outline-none"
                               />
                               <button onClick={handleSaveTax} className="bg-[#1d8cf8] hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold transition-colors">
                                  Save
                               </button>
                            </div>
                         </div>
                         <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/10 w-full md:w-auto">
                             <div className="bg-[#e14eca]/20 p-2 rounded-lg text-[#e14eca]"><Server size={18}/></div>
                             <div className="text-xs">
                                <div className="text-white font-bold">Status</div>
                                <div className="text-green-400">Online</div>
                             </div>
                         </div>
                     </div>
                </DashboardCard>
            </div>
        </div>
      )}

      {/* ORDERS TAB (Styled Dark) */}
      {activeTab === 'orders' && (
          <div className="bg-[#27293d] rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in duration-300">
             <div className="p-4 border-b border-white/10 font-bold flex justify-between text-white">
                 <span>Recent Orders</span>
                 <span className="text-sm text-gray-400 font-normal">Total: {localOrders.length}</span>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left text-gray-300">
                   <thead className="bg-white/5 text-gray-100 uppercase text-xs">
                       <tr>
                           <th className="p-4">Order ID</th>
                           <th className="p-4">Date</th>
                           <th className="p-4">Total</th>
                           <th className="p-4">Status</th>
                           <th className="p-4 text-right">Actions</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                       {localOrders.map(order => (
                           <tr key={order.id} className="hover:bg-white/5 transition-colors">
                               <td className="p-4 font-mono text-[#1d8cf8]">{order.id}</td>
                               <td className="p-4">{new Date(order.timestamp).toLocaleDateString()}</td>
                               <td className="p-4 font-bold text-white">฿{order.totalAmount.toLocaleString()}</td>
                               <td className="p-4">
                                   <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                      ${order.status === 'verified' || order.status === 'paid' ? 'text-[#1d8cf8] bg-[#1d8cf8]/10' : 
                                        order.status === 'shipped' ? 'text-[#00f2c3] bg-[#00f2c3]/10' :
                                        order.status === 'issue_reported' ? 'text-[#fd5d93] bg-[#fd5d93]/10' : 'text-gray-400 bg-gray-700/50'}`}>
                                      {order.status}
                                   </span>
                               </td>
                               <td className="p-4 text-right space-x-2 flex justify-end">
                                   <button onClick={() => setViewOrder(order)} className="bg-[#1d8cf8] text-white p-1.5 rounded hover:bg-blue-600"><Eye size={14}/></button>
                                   <button onClick={() => handleVerifyOrder(order.id)} className="bg-[#00f2c3] text-black p-1.5 rounded hover:bg-teal-400"><Check size={14}/></button>
                                   <button onClick={() => openIssueModal(order.id)} className="bg-[#fd5d93] text-white p-1.5 rounded hover:bg-pink-600"><AlertTriangle size={14}/></button>
                               </td>
                           </tr>
                       ))}
                   </tbody>
               </table>
             </div>
          </div>
      )}

      {/* PROMOTIONS TAB (Styled Dark) */}
      {activeTab === 'promotions' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-300">
              <div className="bg-[#27293d] p-6 rounded-xl shadow-lg h-fit">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><Plus size={20} className="text-[#e14eca]"/> Create Coupon</h2>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Code</label>
                          <input type="text" value={newCoupon.code || ''} onChange={e => setNewCoupon({...newCoupon, code: e.target.value})} className="w-full bg-[#1e1e2f] border border-gray-700 p-2 rounded text-white uppercase focus:border-[#e14eca] outline-none" placeholder="e.g. SUMMER50"/>
                      </div>
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Type</label>
                          <select value={newCoupon.type} onChange={e => setNewCoupon({...newCoupon, type: e.target.value as any})} className="w-full bg-[#1e1e2f] border border-gray-700 p-2 rounded text-white outline-none">
                              <option value="fixed">Fixed Amount (THB)</option>
                              <option value="percent">Percentage (%)</option>
                              <option value="free_shipping">Free Shipping</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Value</label>
                          <input type="number" value={newCoupon.value} onChange={e => setNewCoupon({...newCoupon, value: Number(e.target.value)})} className="w-full bg-[#1e1e2f] border border-gray-700 p-2 rounded text-white outline-none" disabled={newCoupon.type === 'free_shipping'}/>
                      </div>
                      <button onClick={handleAddCoupon} className="w-full bg-gradient-to-r from-[#e14eca] to-[#ba54f5] text-white py-2 rounded font-bold hover:opacity-90 transition-opacity">Create Coupon</button>
                  </div>
              </div>

              <div className="md:col-span-2 bg-[#27293d] rounded-xl shadow-lg overflow-hidden">
                  <div className="p-4 border-b border-white/10 font-bold text-white">Active Promotions</div>
                  <table className="w-full text-sm text-gray-300">
                      <thead className="bg-white/5 text-xs uppercase">
                          <tr>
                              <th className="p-3 text-left">Code</th>
                              <th className="p-3 text-left">Type</th>
                              <th className="p-3 text-left">Value</th>
                              <th className="p-3 text-center">Status</th>
                              <th className="p-3 text-center">Action</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                          {coupons.map(c => (
                              <tr key={c.id}>
                                  <td className="p-3 font-bold text-[#e14eca]">{c.code}</td>
                                  <td className="p-3 capitalize">{c.type.replace('_', ' ')}</td>
                                  <td className="p-3">{c.type === 'percent' ? `${c.value}%` : c.type === 'fixed' ? `฿${c.value}` : '-'}</td>
                                  <td className="p-3 text-center">
                                      <span className={`px-2 py-0.5 rounded text-xs ${c.isActive ? 'bg-[#00f2c3]/20 text-[#00f2c3]' : 'bg-gray-700 text-gray-500'}`}>
                                          {c.isActive ? 'Active' : 'Inactive'}
                                      </span>
                                  </td>
                                  <td className="p-3 text-center">
                                      <button onClick={() => toggleCoupon(c.id)} className="text-[#1d8cf8] hover:underline">
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

      {/* VIEW ORDER DETAILS MODAL (Light Mode for contrast or Dark Mode?) -> Let's keep it clean light/white for readability or dark to match theme? Let's go Dark to match dashboard. */}
      {viewOrder && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-[#27293d] rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col text-white border border-gray-700">
                <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-[#1e1e2f]">
                    <div>
                      <h3 className="text-xl font-bold">Order #{viewOrder.id}</h3>
                      <p className="text-xs text-gray-400">Placed on {new Date(viewOrder.timestamp).toLocaleString()}</p>
                    </div>
                    <button onClick={() => setViewOrder(null)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={28}/></button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-[#1e1e2f] p-4 rounded-lg border border-gray-700">
                            <h4 className="font-bold text-[#1d8cf8] mb-2 border-b border-gray-700 pb-2">Customer & Status</h4>
                            <div className="space-y-2 text-sm text-gray-300">
                                <div className="flex justify-between"><span className="text-gray-500">User ID:</span> <span>{viewOrder.userId}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Payment:</span> <span className="uppercase">{viewOrder.paymentMethod}</span></div>
                                <div className="flex justify-between items-center"><span className="text-gray-500">Status:</span> 
                                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase
                                      ${viewOrder.status === 'verified' || viewOrder.status === 'paid' ? 'text-[#1d8cf8] bg-[#1d8cf8]/10' : 
                                        viewOrder.status === 'shipped' ? 'text-[#00f2c3] bg-[#00f2c3]/10' :
                                        viewOrder.status === 'issue_reported' ? 'text-[#fd5d93] bg-[#fd5d93]/10' : 'text-gray-400 bg-gray-700'}`}>
                                      {viewOrder.status}
                                  </span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#1e1e2f] p-4 rounded-lg border border-gray-700">
                           <h4 className="font-bold text-[#00f2c3] mb-2 border-b border-gray-700 pb-2">Financials</h4>
                           <div className="space-y-1 text-sm text-gray-300">
                                <div className="flex justify-between"><span>Subtotal:</span> <span>฿{viewOrder.subtotal?.toLocaleString() ?? 0}</span></div>
                                <div className="flex justify-between text-[#00f2c3]"><span>Discount:</span> <span>-฿{viewOrder.discountTotal?.toLocaleString() ?? 0}</span></div>
                                <div className="flex justify-between text-gray-500"><span>VAT:</span> <span>฿{viewOrder.taxAmount?.toLocaleString() ?? 0}</span></div>
                                <div className="flex justify-between text-gray-500"><span>Shipping:</span> <span>฿{viewOrder.shippingTotal?.toLocaleString() ?? 0}</span></div>
                                <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-gray-700"><span>Total:</span> <span className="text-[#1d8cf8]">฿{viewOrder.totalAmount?.toLocaleString()}</span></div>
                           </div>
                        </div>
                    </div>

                    <div className="bg-[#1e1e2f] rounded-lg border border-gray-700 overflow-hidden mb-6">
                        <div className="bg-gray-800 px-4 py-2 font-bold text-sm text-gray-300">Order Items</div>
                        <table className="w-full text-sm text-gray-300">
                            <thead className="bg-gray-900 text-gray-500 border-b border-gray-700">
                                <tr>
                                    <th className="p-3 text-left">Product Name</th>
                                    <th className="p-3 text-right">Unit Price</th>
                                    <th className="p-3 text-center">Qty</th>
                                    <th className="p-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
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
                </div>
                
                <div className="p-4 bg-[#1e1e2f] border-t border-gray-700 flex justify-end gap-2">
                    <button onClick={() => setViewOrder(null)} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded font-bold text-white transition-colors">Close</button>
                </div>
            </div>
        </div>
      )}

      {/* ISSUE MODAL (Dark Mode) */}
      {issueModalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="bg-[#27293d] p-6 rounded-xl shadow-lg w-96 border border-gray-700">
                  <h3 className="text-lg font-bold mb-4 text-[#fd5d93]">Report Issue</h3>
                  <textarea 
                    value={issueNote} 
                    onChange={e => setIssueNote(e.target.value)}
                    className="w-full bg-[#1e1e2f] border border-gray-600 text-white p-2 rounded h-32 mb-4 focus:border-[#fd5d93] outline-none" 
                    placeholder="Describe the issue (e.g., Damaged item, Wrong color)..."
                  ></textarea>
                  <div className="flex justify-end gap-2">
                      <button onClick={() => setIssueModalOpen(false)} className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600">Cancel</button>
                      <button onClick={submitIssue} className="px-4 py-2 bg-[#fd5d93] text-white rounded hover:bg-pink-600">Submit Report</button>
                  </div>
              </div>
          </div>
      )}

      {/* Styles for custom scrollbar (injected via style tag for simplicity in component) */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e1e2f; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #444; 
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555; 
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;