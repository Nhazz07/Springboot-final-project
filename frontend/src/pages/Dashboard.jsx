import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productService, categoryService, supplierService } from '../services/api';
import {
  Package,
  AlertTriangle,
  DollarSign,
  Layers,
  ArrowUpRight,
  Plus,
  CreditCard,
  RefreshCw,
  TrendingUp,
  Truck,
  CheckCircle2,
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  // Non-admin users are strictly forbidden from viewing the Executive Dashboard
  if (!isAdmin) {
    return <Navigate to="/products" replace />;
  }

  const [products, setProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, lowRes, catRes, supRes] = await Promise.all([
        productService.getAll().catch(() => []),
        productService.getLowStock().catch(() => []),
        categoryService.getAll().catch(() => []),
        supplierService.getAll().catch(() => []),
      ]);

      setProducts(prodRes);
      setLowStockProducts(lowRes);
      setCategories(catRes);
      setSuppliers(supRes);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
      setError('Could not connect to backend server. Make sure Spring Boot is running on port 3000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute Metrics
  const totalProducts = products.length;
  const totalStockUnits = products.reduce((acc, p) => acc + (p.quantity || 0), 0);
  const totalInventoryValue = products.reduce(
    (acc, p) => acc + (p.quantity || 0) * (Number(p.price) || 0),
    0
  );
  const lowStockCount = lowStockProducts.length;

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-white border border-black/8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1d1d1f]/8 text-[#1d1d1f] text-xs font-semibold mb-3 border border-[#1d1d1f]/15">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1d1d1f] animate-ping" />
              Live BI Radar
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] tracking-tight">
              Inventory & Sales Overview
            </h2>
            <p className="text-[#86868b] text-sm mt-1 max-w-xl">
              Real-time synchronization with PostgreSQL database and Spring Boot REST API.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2.5 rounded-full bg-white hover:bg-[#f5f5f7] border border-black/10 text-xs font-semibold text-[#1d1d1f] shadow-xs hover:shadow-sm transition flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => navigate('/pos')}
              className="px-5 py-2.5 rounded-full bg-[#1d1d1f] hover:bg-[#333336] text-white text-xs font-semibold shadow-md shadow-black/15 transition flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>Launch POS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchData}
            className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 text-xs font-semibold rounded-full"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Value */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden bg-white border border-black/8 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#86868b]">
              Total Inventory Value
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#1d1d1f]/8 border border-[#1d1d1f]/15 flex items-center justify-center text-[#1d1d1f]">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-[#1d1d1f] tracking-tight">
              ${totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-[#86868b] mt-1 flex items-center gap-1">
              <span className="text-[#30d158] font-medium">{totalStockUnits} units</span> in stock
            </p>
          </div>
        </div>

        {/* Total Products */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden bg-white border border-black/8 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#86868b]">
              Active Catalog SKUs
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#1d1d1f]/8 border border-[#1d1d1f]/15 flex items-center justify-center text-[#1d1d1f]">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-[#1d1d1f] tracking-tight">{totalProducts}</p>
            <p className="text-xs text-[#86868b] mt-1 flex items-center gap-1">
              <span>{categories.length} categories</span> • <span>{suppliers.length} suppliers</span>
            </p>
          </div>
        </div>

        {/* Low Stock Warnings */}
        <div
          onClick={() => navigate('/products?filter=low')}
          className="glass-card rounded-2xl p-5 relative overflow-hidden cursor-pointer hover:border-amber-500/40 transition bg-white border border-black/8 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#ff9f0a]">
              Low Stock Warnings
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#ff9f0a]">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-[#ff9f0a] tracking-tight">{lowStockCount}</p>
            <p className="text-xs text-[#86868b] mt-1 flex items-center gap-1">
              {lowStockCount > 0 ? (
                <span className="text-[#ff9f0a] font-medium">Requires immediate restock</span>
              ) : (
                <span className="text-[#30d158] font-medium">All stock levels healthy</span>
              )}
            </p>
          </div>
        </div>

        {/* System Category Health */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden bg-white border border-black/8 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#86868b]">
              Partners & Chains
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-[#1d1d1f] tracking-tight">{suppliers.length}</p>
            <p className="text-xs text-[#86868b] mt-1 flex items-center gap-1">
              <span className="text-purple-600 font-medium">Verified Vendors</span> connected
            </p>
          </div>
        </div>
      </div>

      {/* Quick Launch & Actions Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/products?action=new')}
          className="p-4 rounded-2xl bg-white hover:bg-[#f5f5f7] border border-black/8 text-left transition flex items-center justify-between group shadow-xs hover:shadow-sm"
        >
          <div>
            <p className="text-sm font-semibold text-[#1d1d1f] group-hover:text-black transition">
              + New Product
            </p>
            <p className="text-xs text-[#86868b]">With Cloudinary upload</p>
          </div>
          <Plus className="w-5 h-5 text-[#86868b] group-hover:text-black group-hover:rotate-90 transition" />
        </button>

        <button
          onClick={() => navigate('/categories')}
          className="p-4 rounded-2xl bg-white hover:bg-[#f5f5f7] border border-black/8 text-left transition flex items-center justify-between group shadow-xs hover:shadow-sm"
        >
          <div>
            <p className="text-sm font-semibold text-[#1d1d1f] group-hover:text-black transition">
              Categories
            </p>
            <p className="text-xs text-[#86868b]">{categories.length} registered</p>
          </div>
          <Layers className="w-5 h-5 text-[#86868b] group-hover:text-black transition" />
        </button>

        <button
          onClick={() => navigate('/suppliers')}
          className="p-4 rounded-2xl bg-white hover:bg-[#f5f5f7] border border-black/8 text-left transition flex items-center justify-between group shadow-xs hover:shadow-sm"
        >
          <div>
            <p className="text-sm font-semibold text-[#1d1d1f] group-hover:text-[#af52de] transition">
              Suppliers
            </p>
            <p className="text-xs text-[#86868b]">{suppliers.length} active</p>
          </div>
          <Truck className="w-5 h-5 text-[#86868b] group-hover:text-[#af52de] transition" />
        </button>

        <button
          onClick={() => navigate('/pos')}
          className="p-4 rounded-2xl bg-[#30d158]/10 hover:bg-[#30d158]/15 border border-[#30d158]/20 text-left transition flex items-center justify-between group shadow-xs hover:shadow-sm"
        >
          <div>
            <p className="text-sm font-semibold text-[#1da441]">
              Open POS Cart
            </p>
            <p className="text-xs text-[#86868b]">Order Terminal</p>
          </div>
          <ArrowUpRight className="w-5 h-5 text-[#1da441] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
        </button>
      </div>

      {/* Two-Column Detail Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 spans): Low Stock Radar */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-black/8 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-[#1d1d1f] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#ff9f0a]" />
                Critical Low Stock Radar
              </h3>
              <p className="text-xs text-[#86868b]">Items at or below minimum threshold</p>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="text-xs text-[#1d1d1f] hover:underline font-semibold"
            >
              View Full Catalog →
            </button>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#f5f5f7] border border-black/5">
              <CheckCircle2 className="w-10 h-10 text-[#30d158] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#1d1d1f]">All Stock Levels Healthy</p>
              <p className="text-xs text-[#86868b] mt-1">No products are currently below their minimum safety threshold.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-black/8 text-[#86868b] uppercase tracking-wider">
                    <th className="py-3 px-4 font-semibold">Product</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold">Current Qty</th>
                    <th className="py-3 px-4 font-semibold">Safety Min</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {lowStockProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-[#f5f5f7] transition">
                      <td className="py-3.5 px-4 font-medium text-[#1d1d1f] flex items-center gap-2.5">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-8 h-8 rounded-lg object-cover bg-black/5 border border-black/8"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-black/5 border border-black/8 flex items-center justify-center text-[#86868b] font-bold text-[10px]">
                            SKU
                          </div>
                        )}
                        <span>{p.name}</span>
                      </td>
                      <td className="py-3.5 px-4 text-[#86868b]">
                        {p.categoryName || 'General'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-[#ff3b30] border border-red-500/20">
                          {p.quantity} units
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#86868b]">
                        {p.minStockLevel || 5} units
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => navigate(`/products?edit=${p.id}`)}
                          className="px-3.5 py-1 rounded-full bg-[#1d1d1f] hover:bg-[#333336] text-white font-medium transition shadow-xs hover:shadow-sm"
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Fast Category Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-black/8 shadow-sm">
          <h3 className="text-base font-bold text-[#1d1d1f] mb-1">Catalog Categories</h3>
          <p className="text-xs text-[#86868b] mb-4">Item segmentation</p>

          <div className="space-y-3">
            {categories.slice(0, 6).map((cat) => (
              <div
                key={cat.id}
                className="p-3 rounded-2xl bg-[#f5f5f7] border border-black/5 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-[#1d1d1f]">{cat.name}</p>
                  <p className="text-xs text-[#86868b] truncate max-w-35">
                    {cat.description || 'Category'}
                  </p>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-black/5 text-[#86868b] border border-black/8">
                  ID: #{cat.id}
                </span>
              </div>
            ))}

            {categories.length === 0 && (
              <div className="p-6 text-center text-xs text-[#86868b]">
                No categories registered yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
