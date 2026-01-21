import React from 'react';
import { ShoppingCart, Search, User, LogOut, LayoutDashboard, Menu } from 'lucide-react';
import { User as UserType } from '../types';

interface NavbarProps {
  user: UserType | null;
  cartCount: number;
  onLogout: () => void;
  onNavigate: (path: string) => void;
  onCategoryClick: (category: string) => void;
}

// EDIT HERE: Add or Remove menu items in this array
const MENU_ITEMS = [
  "Notebook",
  "Desktop PC",
  "All-in-One",
  "DIY Computer",
  "Monitor",
  "Gaming Gear"
];

const Navbar: React.FC<NavbarProps> = ({ user, cartCount, onLogout, onNavigate, onCategoryClick }) => {
  return (
    <header className="sticky top-0 z-50">
      {/* Top Bar - Very Dark Blue */}
      <div className="bg-[#002d6b] text-white text-xs py-1 px-4 hidden md:block">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex space-x-4">
            <span>Call Center: 1490</span>
            <span>Service Centers</span>
          </div>
          <div className="flex space-x-4">
            <span>Corporate</span>
            <span>Check Order Status</span>
          </div>
        </div>
      </div>

      {/* Main Header - Advice Blue */}
      <div className="bg-advice-blue shadow-md text-white py-3">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo Section */}
          <div className="flex items-center space-x-4 w-full md:w-auto justify-between">
             <div 
               className="text-2xl font-bold italic tracking-wide cursor-pointer flex items-center gap-2"
               onClick={() => onNavigate('/')}
             >
                <div className="bg-white text-advice-blue p-1 rounded font-black">IT</div>
                <span>Advice-Like</span>
             </div>
             <button className="md:hidden text-white"><Menu /></button>
          </div>

          {/* Search Bar */}
          <div className="flex-1 w-full max-w-2xl relative">
            <div className="flex bg-white rounded-md overflow-hidden">
               <select className="bg-gray-100 text-gray-700 text-sm px-2 border-r border-gray-300 outline-none hidden sm:block">
                  <option>All Categories</option>
                  <option>Notebook</option>
                  <option>DIY Computer</option>
               </select>
               <input 
                 type="text" 
                 placeholder="Search for products (e.g., RTX 4090, CPU i9)" 
                 className="flex-1 px-4 py-2 text-gray-800 outline-none w-full"
               />
               <button className="bg-advice-orange hover:bg-orange-500 text-white px-6 py-2 font-bold transition-colors">
                 <Search size={20} />
               </button>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-6 w-full md:w-auto justify-center md:justify-end">
             {/* Cart */}
             <div 
               className="relative cursor-pointer group"
               onClick={() => onNavigate('/cart')}
             >
                <ShoppingCart size={28} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
                <span className="text-xs block text-center group-hover:text-yellow-300">Cart</span>
             </div>

             {/* User Profile / Login */}
             {user?.isAuthenticated ? (
               <div className="flex items-center space-x-4">
                 <div className="text-right hidden lg:block">
                    <div className="text-sm font-bold">{user.name}</div>
                    <div className="text-xs text-blue-200">{user.role.toUpperCase()}</div>
                 </div>
                 
                 {user.role === 'admin' && (
                   <button 
                    onClick={() => onNavigate('/admin/dashboard')}
                    className="p-2 hover:bg-blue-600 rounded-full tooltip"
                    title="Admin Dashboard"
                   >
                     <LayoutDashboard size={24} />
                   </button>
                 )}

                 <button 
                   onClick={onLogout}
                   className="p-2 hover:bg-blue-600 rounded-full"
                   title="Logout"
                 >
                   <LogOut size={24} />
                 </button>
               </div>
             ) : (
               <div className="flex items-center space-x-3 text-sm">
                  <button onClick={() => onNavigate('/login')} className="hover:text-yellow-300 font-bold border border-white px-3 py-1 rounded">
                    Login
                  </button>
                  <button onClick={() => onNavigate('/register')} className="hover:text-yellow-300">
                    Register
                  </button>
               </div>
             )}
          </div>
        </div>
      </div>
      
      {/* Category Bar - White */}
      <div className="bg-white shadow-sm border-b border-gray-200 hidden lg:block">
        <div className="container mx-auto px-4">
           <ul className="flex space-x-8 text-sm font-medium text-gray-700 py-3">
              {MENU_ITEMS.map((item) => (
                <li 
                  key={item} 
                  className="hover:text-advice-blue cursor-pointer transition-colors"
                  onClick={() => onCategoryClick(item)}
                >
                  {item}
                </li>
              ))}
              <li className="text-red-600 font-bold cursor-pointer hover:text-red-700">Hot Sale!</li>
           </ul>
        </div>
      </div>
    </header>
  );
};

export default Navbar;