import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Plus, Radio, User } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
      case '/home':
      case '/landing':
        return isAdmin ? 'Executive Dashboard' : 'Storefront';
      case '/products':
        return isAdmin ? 'Product Catalog & Stock' : 'Shopping Catalog';
      case '/categories':
        return 'Category Management';
      case '/suppliers':
        return 'Supplier Directory';
      case '/users':
        return 'Staff & Access Control';
      case '/pos':
        return 'Point of Sale (Terminal)';
      case '/profile':
        return 'My Profile & Settings';
      default:
        return 'Overview';
    }
  };

  return (
    <header className="h-16 px-8 bg-white/80 backdrop-blur-xl border-b border-black/8 sticky top-0 z-20 flex items-center justify-between">
      {/* Title & Path */}
      <div>
        <h1 className="text-lg font-bold text-[#1d1d1f] tracking-tight">{getPageTitle()}</h1>
        <p className="text-xs text-[#86868b]">Inventory Management System • Spring Boot</p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Backend Status indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#30d158]/10 border border-[#30d158]/20 text-xs font-medium text-[#1da441]">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>API :3000 Active</span>
        </div>

        {/* Quick Add Product Button (Admin Only) */}
        {isAdmin && (
          <button
            onClick={() => navigate('/products?action=new')}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#1d1d1f] hover:bg-[#333336] text-white text-xs font-semibold shadow-md shadow-black/15 transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Product</span>
          </button>
        )}

        {/* Profile Pill - Click to go to /profile */}
        <button
          onClick={() => navigate('/profile')}
          title="Account Settings & Avatar"
          className="flex items-center gap-2 px-3 py-1 rounded-full bg-white hover:bg-[#f5f5f7] border border-black/8 shadow-sm transition active:scale-95"
        >
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.username}
              className="w-7 h-7 rounded-full object-cover border border-black/8 shadow-xs"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#1d1d1f] flex items-center justify-center text-[11px] font-bold text-white uppercase shadow-xs">
              {user?.username?.[0] || 'U'}
            </div>
          )}
          <span className="text-xs font-medium text-[#1d1d1f] hidden md:inline">
            {user?.username || 'Mongkol'}
          </span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
