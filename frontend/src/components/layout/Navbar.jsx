import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  CreditCard,
  LogOut,
  Plus,
  Radio,
  ShoppingBag,
  ShoppingCart,
  User
} from 'lucide-react';
const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, isAuthenticated, logout } = useAuth();

  const userNavItems = isAuthenticated
    ? [
        { name: 'Storefront', path: '/landing', icon: ShoppingBag },
        { name: 'Catalog', path: '/products', icon: ShoppingBag },
        { name: 'Cart', path: '/cart', icon: ShoppingCart },
        { name: 'Profile', path: '/profile', icon: User },
      ]
      : [
        { name: 'Storefront', path: '/', icon: ShoppingBag },
        { name: 'Catalog', path: '/catalog', icon: ShoppingBag },
        { name: 'Cart', path: '/cart', icon: ShoppingCart },
        { name: 'Sign In', path: '/login', icon: User },
      ];

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="min-h-16 px-4 sm:px-8 py-3 bg-white/80 backdrop-blur-xl border-b border-black/8 sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-lg font-bold text-[#1d1d1f] tracking-tight">{getPageTitle()}</h1>
        <p className="text-xs text-[#86868b]">Inventory Management System - Spring Boot</p>
      </div>

      {!isAdmin && (
        <nav
          className="order-3 flex w-full items-center gap-1 overflow-x-auto md:order-none md:w-auto"
          aria-label="Customer navigation"
        >
          {userNavItems.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/landing'}
              title={name}
              className={({ isActive }) =>
                `inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-[#1d1d1f] text-white shadow-sm'
                    : 'text-[#6e6e73] hover:bg-black/5 hover:text-[#1d1d1f]'
                }`
              }
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{name}</span>
            </NavLink>
          ))}
        </nav>
      )}

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#30d158]/10 border border-[#30d158]/20 text-xs font-medium text-[#1da441]">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>API :3000 Active</span>
        </div>

        {isAdmin && (
          <button
            onClick={() => navigate('/products?action=new')}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#1d1d1f] hover:bg-[#333336] text-white text-xs font-semibold shadow-md shadow-black/15 transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Product</span>
          </button>
        )}

        <button
          onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
          title={isAuthenticated ? 'Account Settings & Avatar' : 'Sign In'}
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
            {user?.username || 'Guest'}
          </span>
        </button>

        {!isAdmin && isAuthenticated && (
          <button
            onClick={handleLogout}
            title="Sign Out"
            aria-label="Sign Out"
            className="rounded-full p-2 text-[#86868b] transition hover:bg-red-500/10 hover:text-[#ff3b30]"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </header>
  );
};

export default Navbar;
