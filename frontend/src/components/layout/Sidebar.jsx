import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Tags,
  Truck,
  CreditCard,
  LogOut,
  Sparkles,
  User,
  Users,
  ShoppingBag,
  Shield,
  Settings,
} from 'lucide-react';

const Sidebar = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    ...(isAdmin
      ? [{ name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }]
      : [{ name: 'Storefront', path: '/', icon: ShoppingBag }]),
    { name: isAdmin ? 'Products' : 'Shopping Catalog', path: '/products', icon: Package },
    ...(isAdmin
      ? [
          { name: 'Categories', path: '/categories', icon: Tags },
          { name: 'Suppliers', path: '/suppliers', icon: Truck },
          { name: 'Staff & Users', path: '/users', icon: Users },
        ]
      : []),
    { name: 'Point of Sale', path: '/pos', icon: CreditCard, highlight: true },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  return (
    <aside className="w-64 h-screen flex flex-col justify-between bg-white/85 backdrop-blur-2xl border-r border-black/8 shrink-0 sticky top-0 z-30 select-none">
      {/* Top Branding */}
      <div>
        <div className="p-6 pb-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1d1d1f] flex items-center justify-center shadow-md shadow-black/20 text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-[#1d1d1f]">IMS Pro</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-black/5 text-[#86868b] border border-black/8">
                v27
              </span>
            </div>
            <p className="text-[11px] text-[#86868b] font-medium">Inventory & Retail</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 py-2 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#86868b]">
            Main Management
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[#1d1d1f] text-white shadow-md shadow-black/15'
                      : 'text-[#1d1d1f] hover:text-black hover:bg-black/5'
                  }`
                }
              >
                {({ isActive }) => (
                  <div className="flex items-center gap-3 w-full">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#6e6e73]'}`} />
                    <span>{item.name}</span>
                    {item.highlight && (
                      <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#30d158]/15 text-[#1da441] border border-[#30d158]/25">
                        POS
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile Section */}
      <div className="p-3 border-t border-black/8">
        <div className="p-3 rounded-2xl bg-white border border-black/8 hover:bg-[#f5f5f7] shadow-sm transition flex items-center justify-between mb-2">
          <div
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
          >
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.username}
                className="w-9 h-9 rounded-xl object-cover shrink-0 border border-black/8 shadow-xs"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-[#1d1d1f] flex items-center justify-center text-white shrink-0 shadow-xs uppercase font-bold text-xs">
                {user?.username?.[0] || 'U'}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#1d1d1f] truncate group-hover:text-black transition">
                {user?.username || 'Mongkol'}
              </p>
              <div className="flex items-center gap-1">
                {isAdmin ? (
                  <>
                    <Shield className="w-3 h-3 text-[#30d158] shrink-0" />
                    <span className="text-[10px] font-medium text-[#1da441] truncate">
                      Admin Access
                    </span>
                  </>
                ) : (
                  <>
                    <User className="w-3 h-3 text-[#86868b] shrink-0" />
                    <span className="text-[10px] font-medium text-[#86868b] truncate">
                      Customer
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2 rounded-xl text-[#86868b] hover:text-[#ff3b30] hover:bg-red-500/10 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
