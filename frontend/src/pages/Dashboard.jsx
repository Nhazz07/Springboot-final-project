import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productService, categoryService, supplierService, orderService } from '../services/api';
import {
  Package,
  AlertTriangle,
  DollarSign,
  Layers,
  ArrowUpRight,
  Plus,
  ClipboardList,
  RefreshCw,
  TrendingUp,
  Truck,
  CheckCircle2,
  XCircle,
  Percent,
  Calendar,
  ShoppingBag,
  ArrowDownRight,
  Sparkles,
  ShieldAlert,
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
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Graph state
  const [graphDays, setGraphDays] = useState(7); // 7, 14, 30
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, lowRes, catRes, supRes, ordRes] = await Promise.all([
        productService.getAll().catch(() => []),
        productService.getLowStock().catch(() => []),
        categoryService.getAll().catch(() => []),
        supplierService.getAll().catch(() => []),
        orderService.getAll().catch(() => []),
      ]);

      setProducts(prodRes || []);
      setLowStockProducts(lowRes || []);
      setCategories(catRes || []);
      setSuppliers(supRes || []);
      setOrders(ordRes || []);
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

  // Map products by ID for instant O(1) cost/price lookups
  const productMap = useMemo(() => {
    const map = new Map();
    products.forEach((p) => map.set(p.id, p));
    return map;
  }, [products]);

  // Inventory Asset Valuations
  const totalProducts = products.length;
  const totalStockUnits = products.reduce((acc, p) => acc + (p.quantity || 0), 0);
  const totalInventoryRetailValue = products.reduce(
    (acc, p) => acc + (p.quantity || 0) * (Number(p.price) || 0),
    0
  );
  const totalInventoryCostBasis = products.reduce(
    (acc, p) => acc + (p.quantity || 0) * (Number(p.costPrice) || 0),
    0
  );
  const unrealizedInventoryProfit = Math.max(0, totalInventoryRetailValue - totalInventoryCostBasis);
  const lowStockCount = lowStockProducts.length;

  // Comprehensive Sales, Profit, and Cancellation Analytics
  const analytics = useMemo(() => {
    let realizedRevenue = 0;
    let realizedCost = 0;
    let cancelledCount = 0;
    let cancelledRevenue = 0;
    let completedCount = 0;
    let completedRevenue = 0;
    let pendingCount = 0;
    let pendingRevenue = 0;
    let shippedCount = 0;
    let shippedRevenue = 0;

    const productSalesMap = new Map();

    orders.forEach((order) => {
      const orderTotal = Number(order.totalAmount) || 0;
      const status = (order.status || 'PENDING').toUpperCase();

      if (status === 'CANCELLED') {
        cancelledCount++;
        cancelledRevenue += orderTotal;
      } else {
        realizedRevenue += orderTotal;
        if (status === 'COMPLETED') {
          completedCount++;
          completedRevenue += orderTotal;
        } else if (status === 'SHIPPED') {
          shippedCount++;
          shippedRevenue += orderTotal;
        } else {
          pendingCount++;
          pendingRevenue += orderTotal;
        }

        // Calculate Cost of Goods Sold and product-level profitability
        (order.items || []).forEach((item) => {
          const prod = productMap.get(item.productId);
          const costPrice = prod?.costPrice ? Number(prod.costPrice) : 0;
          const unitPrice = item.unitPrice
            ? Number(item.unitPrice)
            : (prod?.price ? Number(prod.price) : 0);
          const qty = item.quantity || 1;
          const itemRev = unitPrice * qty;
          const itemCost = costPrice * qty;
          const itemProfit = itemRev - itemCost;

          realizedCost += itemCost;

          const existing = productSalesMap.get(item.productId) || {
            id: item.productId,
            name: item.productName || prod?.name || `Product #${item.productId}`,
            category: prod?.categoryName || 'General',
            imageUrl: prod?.imageUrl,
            unitsSold: 0,
            revenue: 0,
            profit: 0,
            stock: prod?.quantity ?? 0,
          };
          existing.unitsSold += qty;
          existing.revenue += itemRev;
          existing.profit += itemProfit;
          productSalesMap.set(item.productId, existing);
        });
      }
    });

    const netProfit = Math.max(0, realizedRevenue - realizedCost);
    const profitMargin = realizedRevenue > 0 ? (netProfit / realizedRevenue) * 100 : 0;
    const totalOrders = orders.length;
    const cancellationRate = totalOrders > 0 ? (cancelledCount / totalOrders) * 100 : 0;
    const topProducts = Array.from(productSalesMap.values()).sort((a, b) => b.profit - a.profit);

    return {
      realizedRevenue,
      realizedCost,
      netProfit,
      profitMargin,
      totalOrders,
      cancelledCount,
      cancelledRevenue,
      cancellationRate,
      completedCount,
      completedRevenue,
      shippedCount,
      shippedRevenue,
      pendingCount,
      pendingRevenue,
      topProducts,
    };
  }, [orders, productMap]);

  // Generate Timeline Data for the Graph based on Selected Timeframe (7, 14, 30 days)
  const timelineData = useMemo(() => {
    const points = [];
    const now = new Date();

    for (let i = graphDays - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const dayOrders = orders.filter((o) => {
        if (!o.createdAt) return false;
        const matchesDate = o.createdAt.startsWith(dateKey);
        const notCancelled = (o.status || '').toUpperCase() !== 'CANCELLED';
        return matchesDate && notCancelled;
      });

      const dayRevenue = dayOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
      let dayCost = 0;
      dayOrders.forEach((o) => {
        (o.items || []).forEach((item) => {
          const prod = productMap.get(item.productId);
          const cost = prod?.costPrice ? Number(prod.costPrice) : 0;
          dayCost += cost * (item.quantity || 1);
        });
      });
      const dayProfit = Math.max(0, dayRevenue - dayCost);

      points.push({
        date: dateKey,
        label,
        revenue: dayRevenue,
        profit: dayProfit,
        orderCount: dayOrders.length,
      });
    }

    return points;
  }, [orders, productMap, graphDays]);

  // Timeline Statistics
  const periodTotalRevenue = timelineData.reduce((acc, p) => acc + p.revenue, 0);
  const periodTotalProfit = timelineData.reduce((acc, p) => acc + p.profit, 0);
  const periodPeakRevenue = Math.max(...timelineData.map((p) => p.revenue), 0);

  // SVG Chart Geometry Helpers
  const chartWidth = 760;
  const chartHeight = 220;
  const padLeft = 55;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 35;
  const innerW = chartWidth - padLeft - padRight;
  const innerH = chartHeight - padTop - padBottom;

  const maxVal = Math.max(...timelineData.map((d) => Math.max(d.revenue, d.profit)), 50) * 1.15;

  const pointsRevenue = timelineData.map((d, i) => {
    const x = padLeft + (i / Math.max(1, timelineData.length - 1)) * innerW;
    const y = padTop + (1 - d.revenue / maxVal) * innerH;
    return { x, y, data: d };
  });

  const pointsProfit = timelineData.map((d, i) => {
    const x = padLeft + (i / Math.max(1, timelineData.length - 1)) * innerW;
    const y = padTop + (1 - d.profit / maxVal) * innerH;
    return { x, y, data: d };
  });

  // Generates smooth cubic Bézier SVG path
  const createSmoothPath = (pts) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i !== pts.length - 2 ? pts[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;

      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const revenueLine = createSmoothPath(pointsRevenue);
  const profitLine = createSmoothPath(pointsProfit);

  const baselineY = padTop + innerH;
  const revenueArea = pointsRevenue.length > 0
    ? `${revenueLine} L ${pointsRevenue[pointsRevenue.length - 1].x} ${baselineY} L ${pointsRevenue[0].x} ${baselineY} Z`
    : '';
  const profitArea = pointsProfit.length > 0
    ? `${profitLine} L ${pointsProfit[pointsProfit.length - 1].x} ${baselineY} L ${pointsProfit[0].x} ${baselineY} Z`
    : '';

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Welcome */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-white border border-black/8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1d1d1f]/8 text-[#1d1d1f] text-xs font-semibold mb-3 border border-[#1d1d1f]/15">
              <span className="w-1.5 h-1.5 rounded-full bg-[#30d158] animate-ping" />
              Executive BI Dashboard
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] tracking-tight">
              Financial & Sales Operations
            </h2>
            <p className="text-[#86868b] text-sm mt-1 max-w-xl">
              Real-time revenue, net profit margin, cancellation impact, and FIFO inventory performance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2 rounded-full bg-white hover:bg-[#f5f5f7] border border-black/10 text-xs font-semibold text-[#1d1d1f] shadow-xs hover:shadow-sm transition flex items-center gap-2 active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => navigate('/orders')}
              className="px-4 py-2 rounded-full bg-[#1d1d1f] hover:bg-[#333336] text-white text-xs font-semibold shadow-md shadow-black/15 transition flex items-center gap-2 active:scale-95"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Orders ({analytics.totalOrders})</span>
            </button>
            <button
              onClick={() => navigate('/products?action=new')}
              className="px-4 py-2 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-md shadow-[#0071e3]/20 transition flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
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

      {/* 5 Core Financial & Operational Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Net Profit Card */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden bg-white border border-black/8 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#248a3d]">
              Net Profit
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#34c759]/10 border border-[#34c759]/20 flex items-center justify-center text-[#248a3d]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-[#248a3d] tracking-tight">
              ${analytics.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#86868b]">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#34c759]/10 text-[#248a3d] font-semibold text-[11px]">
                {analytics.profitMargin.toFixed(1)}%
              </span>
              <span>Profit Margin</span>
            </div>
          </div>
        </div>

        {/* 2. Realized Revenue Card */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden bg-white border border-black/8 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#86868b]">
              Total Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#1d1d1f]/8 border border-[#1d1d1f]/15 flex items-center justify-center text-[#1d1d1f]">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-[#1d1d1f] tracking-tight">
              ${analytics.realizedRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-[#86868b] mt-1.5 flex items-center gap-1">
              <span>{analytics.totalOrders - analytics.cancelledCount} active sales</span>
            </p>
          </div>
        </div>

        {/* 3. Cancellations & Refunds Card */}
        <div
          onClick={() => navigate('/orders')}
          className="glass-card rounded-2xl p-5 relative overflow-hidden bg-white border border-black/8 shadow-sm flex flex-col justify-between cursor-pointer hover:border-[#ff3b30]/30 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#ff3b30]">
              Cancellations
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#ff3b30]/10 border border-[#ff3b30]/20 flex items-center justify-center text-[#ff3b30] group-hover:scale-105 transition">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-[#ff3b30] tracking-tight">
              {analytics.cancelledCount} <span className="text-sm font-normal text-[#86868b]">orders</span>
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#86868b]">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#ff3b30]/10 text-[#ff3b30] font-semibold text-[11px]">
                {analytics.cancellationRate.toFixed(1)}% rate
              </span>
              <span>-${analytics.cancelledRevenue.toFixed(0)} lost</span>
            </div>
          </div>
        </div>

        {/* 4. Warehouse Inventory Assets */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden bg-white border border-black/8 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#86868b]">
              Warehouse Stock Value
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#0071e3]/10 border border-[#0071e3]/20 flex items-center justify-center text-[#0071e3]">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-[#1d1d1f] tracking-tight">
              ${totalInventoryRetailValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-[#86868b] mt-1.5 flex items-center gap-1">
              <span className="text-[#0071e3] font-semibold">{totalStockUnits} units</span> in storage
            </p>
          </div>
        </div>

        {/* 5. Low Stock Alert Radar */}
        <div
          onClick={() => navigate('/products?filter=low')}
          className={`glass-card rounded-2xl p-5 relative overflow-hidden bg-white border shadow-sm flex flex-col justify-between cursor-pointer transition ${
            lowStockCount > 0 ? 'border-amber-500/30 hover:border-amber-500/60' : 'border-black/8'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${lowStockCount > 0 ? 'text-[#ff9500]' : 'text-[#86868b]'}`}>
              Stock Warnings
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${lowStockCount > 0 ? 'bg-amber-500/10 border border-amber-500/20 text-[#ff9500]' : 'bg-[#1d1d1f]/8 text-[#1d1d1f]'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className={`text-2xl font-extrabold tracking-tight ${lowStockCount > 0 ? 'text-[#ff9500]' : 'text-[#1d1d1f]'}`}>
              {lowStockCount} <span className="text-sm font-normal text-[#86868b]">SKUs</span>
            </p>
            <p className="text-xs text-[#86868b] mt-1.5">
              {lowStockCount > 0 ? (
                <span className="text-[#ff9500] font-medium">Requires Restock</span>
              ) : (
                <span className="text-[#30d158] font-medium">All levels safe</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* PERFORMANCE GRAPH SECTION (Revenue & Gross Profit Timeline) */}
      <div className="rounded-3xl p-6 sm:p-8 bg-white border border-black/8 shadow-sm space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[#1d1d1f] tracking-tight">
                Sales Revenue & Profit Performance
              </h3>
              <span className="text-xs font-medium text-[#86868b] bg-[#f5f5f7] px-2.5 py-0.5 rounded-full border border-black/5">
                FIFO Costed
              </span>
            </div>
            <p className="text-xs text-[#86868b] mt-0.5">
              Visual curve tracking realized cash inflows against net operational gross profit.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Legend */}
            <div className="hidden sm:flex items-center gap-4 text-xs font-medium mr-2">
              <span className="flex items-center gap-1.5 text-[#1d1d1f]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1d1d1f]" />
                Revenue
              </span>
              <span className="flex items-center gap-1.5 text-[#248a3d]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#34c759]" />
                Net Profit
              </span>
            </div>

            {/* Timeframe Buttons */}
            <div className="inline-flex rounded-full p-1 bg-[#f5f5f7] border border-black/8">
              {[
                { label: '7 Days', days: 7 },
                { label: '14 Days', days: 14 },
                { label: '30 Days', days: 30 },
              ].map((tf) => (
                <button
                  key={tf.days}
                  onClick={() => setGraphDays(tf.days)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                    graphDays === tf.days
                      ? 'bg-white text-[#1d1d1f] shadow-xs'
                      : 'text-[#86868b] hover:text-[#1d1d1f]'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Period Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#fbfbfd] border border-black/5 text-xs">
          <div>
            <p className="text-[#86868b]">Period Revenue</p>
            <p className="font-bold text-[#1d1d1f] text-sm mt-0.5">${periodTotalRevenue.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[#86868b]">Period Net Profit</p>
            <p className="font-bold text-[#248a3d] text-sm mt-0.5">${periodTotalProfit.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[#86868b]">Daily Peak</p>
            <p className="font-bold text-[#1d1d1f] text-sm mt-0.5">${periodPeakRevenue.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[#86868b]">Period Margin</p>
            <p className="font-bold text-[#0071e3] text-sm mt-0.5">
              {periodTotalRevenue > 0 ? ((periodTotalProfit / periodTotalRevenue) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>

        {/* Interactive Responsive SVG Graph */}
        <div className="relative w-full overflow-hidden select-none">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-55 sm:h-70 overflow-visible"
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              {/* Revenue Area Gradient */}
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1d1d1f" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#1d1d1f" stopOpacity="0.0" />
              </linearGradient>

              {/* Profit Area Gradient */}
              <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34c759" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#34c759" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines & Y-Axis Scale */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const yPos = padTop + pct * innerH;
              const value = (1 - pct) * maxVal;
              return (
                <g key={idx}>
                  <line
                    x1={padLeft}
                    y1={yPos}
                    x2={chartWidth - padRight}
                    y2={yPos}
                    stroke="#000000"
                    strokeOpacity="0.06"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padLeft - 10}
                    y={yPos + 4}
                    textAnchor="end"
                    fill="#86868b"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    ${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toFixed(0)}
                  </text>
                </g>
              );
            })}

            {/* Area Fills */}
            {revenueArea && <path d={revenueArea} fill="url(#revenueGrad)" />}
            {profitArea && <path d={profitArea} fill="url(#profitGrad)" />}

            {/* Curves */}
            {revenueLine && (
              <path
                d={revenueLine}
                fill="none"
                stroke="#1d1d1f"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            )}
            {profitLine && (
              <path
                d={profitLine}
                fill="none"
                stroke="#34c759"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            )}

            {/* X-Axis Date Labels & Interactive Hover Columns */}
            {pointsRevenue.map((pt, idx) => {
              // Determine if we show date label (avoid crowding on 30 days)
              const showLabel =
                graphDays === 7 ||
                (graphDays === 14 && idx % 2 === 0) ||
                (graphDays === 30 && idx % 4 === 0) ||
                idx === pointsRevenue.length - 1;

              const isHovered = hoveredPoint?.index === idx;

              return (
                <g key={idx}>
                  {showLabel && (
                    <text
                      x={pt.x}
                      y={chartHeight - 10}
                      textAnchor="middle"
                      fill={isHovered ? '#1d1d1f' : '#86868b'}
                      fontSize="10"
                      fontWeight={isHovered ? 'bold' : 'normal'}
                    >
                      {pt.data.label}
                    </text>
                  )}

                  {/* Vertical Hover Guide Line */}
                  {isHovered && (
                    <line
                      x1={pt.x}
                      y1={padTop}
                      x2={pt.x}
                      y2={baselineY}
                      stroke="#1d1d1f"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                      strokeOpacity="0.4"
                    />
                  )}

                  {/* Data Points on Hover or with sales */}
                  {(isHovered || pt.data.revenue > 0) && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 5 : 3.5}
                      fill="#ffffff"
                      stroke="#1d1d1f"
                      strokeWidth="2.5"
                    />
                  )}
                  {(isHovered || pointsProfit[idx].data.profit > 0) && (
                    <circle
                      cx={pointsProfit[idx].x}
                      cy={pointsProfit[idx].y}
                      r={isHovered ? 5 : 3.5}
                      fill="#ffffff"
                      stroke="#34c759"
                      strokeWidth="2.5"
                    />
                  )}

                  {/* Invisible Hit Area for Easy Mouse Hover */}
                  <rect
                    x={pt.x - innerW / (timelineData.length * 2)}
                    y={padTop}
                    width={innerW / timelineData.length}
                    height={innerH + 15}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() =>
                      setHoveredPoint({
                        index: idx,
                        x: pt.x,
                        y: pt.y,
                        data: pt.data,
                      })
                    }
                  />
                </g>
              );
            })}
          </svg>

          {/* Floating Tooltip */}
          {hoveredPoint && (
            <div
              className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 rounded-2xl bg-[#1d1d1f] text-white p-3.5 shadow-xl text-xs space-y-1.5 min-w-44 transition-all"
              style={{
                left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                top: `${Math.max(10, (hoveredPoint.y / chartHeight) * 100 - 15)}%`,
              }}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                <span className="font-semibold text-white/90">{hoveredPoint.data.label}</span>
                <span className="text-[10px] text-white/60">{hoveredPoint.data.orderCount} orders</span>
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-white/70">Revenue:</span>
                <span className="font-bold text-white">${hoveredPoint.data.revenue.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Gross Profit:</span>
                <span className="font-bold text-[#30d158]">${hoveredPoint.data.profit.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-white/50 pt-1 border-t border-white/10">
                <span>Margin:</span>
                <span>
                  {hoveredPoint.data.revenue > 0
                    ? ((hoveredPoint.data.profit / hoveredPoint.data.revenue) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ORDER STATUS PIPELINE & CANCELLATION ANALYSIS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Fulfillment & Status Breakdown */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-black/8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-[#1d1d1f] flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#0071e3]" />
                Order Pipeline & Cancellation Breakdown
              </h3>
              <p className="text-xs text-[#86868b] mt-0.5">
                Live delivery status distribution and cancellation impact analysis.
              </p>
            </div>
            <button
              onClick={() => navigate('/orders')}
              className="text-xs text-[#0071e3] hover:underline font-semibold"
            >
              View Order Desk →
            </button>
          </div>

          {/* Proportional Multi-Segment Progress Bar */}
          <div className="space-y-2">
            <div className="h-3.5 w-full rounded-full bg-[#f5f5f7] overflow-hidden flex p-0.5 border border-black/5 gap-0.5">
              {analytics.totalOrders > 0 ? (
                <>
                  <div
                    style={{ width: `${(analytics.completedCount / analytics.totalOrders) * 100}%` }}
                    className="h-full bg-[#34c759] rounded-l-full transition-all duration-500"
                    title={`Completed: ${analytics.completedCount}`}
                  />
                  <div
                    style={{ width: `${(analytics.shippedCount / analytics.totalOrders) * 100}%` }}
                    className="h-full bg-[#0071e3] transition-all duration-500"
                    title={`Shipped: ${analytics.shippedCount}`}
                  />
                  <div
                    style={{ width: `${(analytics.pendingCount / analytics.totalOrders) * 100}%` }}
                    className="h-full bg-[#ff9500] transition-all duration-500"
                    title={`Pending: ${analytics.pendingCount}`}
                  />
                  <div
                    style={{ width: `${(analytics.cancelledCount / analytics.totalOrders) * 100}%` }}
                    className="h-full bg-[#ff3b30] rounded-r-full transition-all duration-500"
                    title={`Cancelled: ${analytics.cancelledCount}`}
                  />
                </>
              ) : (
                <div className="h-full w-full bg-black/10 rounded-full" />
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between text-xs text-[#86868b] pt-1">
              <span>{analytics.totalOrders} Total Orders Registered</span>
              <span className="font-semibold text-[#ff3b30]">
                {analytics.cancellationRate.toFixed(1)}% Cancellation Rate
              </span>
            </div>
          </div>

          {/* 4 Detailed Status Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Completed */}
            <div className="p-3.5 rounded-2xl bg-[#34c759]/8 border border-[#34c759]/20">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#248a3d]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Completed</span>
              </div>
              <p className="text-xl font-bold text-[#1d1d1f] mt-1.5">{analytics.completedCount}</p>
              <p className="text-[11px] text-[#86868b] mt-0.5">
                ${analytics.completedRevenue.toFixed(0)} realized
              </p>
            </div>

            {/* Shipped */}
            <div className="p-3.5 rounded-2xl bg-[#0071e3]/8 border border-[#0071e3]/20">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0071e3]">
                <Truck className="w-3.5 h-3.5" />
                <span>In Transit</span>
              </div>
              <p className="text-xl font-bold text-[#1d1d1f] mt-1.5">{analytics.shippedCount}</p>
              <p className="text-[11px] text-[#86868b] mt-0.5">
                ${analytics.shippedRevenue.toFixed(0)} en route
              </p>
            </div>

            {/* Pending */}
            <div className="p-3.5 rounded-2xl bg-[#ff9500]/8 border border-[#ff9500]/20">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#ff9500]">
                <Calendar className="w-3.5 h-3.5" />
                <span>Processing</span>
              </div>
              <p className="text-xl font-bold text-[#1d1d1f] mt-1.5">{analytics.pendingCount}</p>
              <p className="text-[11px] text-[#86868b] mt-0.5">
                ${analytics.pendingRevenue.toFixed(0)} awaiting
              </p>
            </div>

            {/* Cancelled */}
            <div className="p-3.5 rounded-2xl bg-[#ff3b30]/8 border border-[#ff3b30]/20">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#ff3b30]">
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancelled</span>
              </div>
              <p className="text-xl font-bold text-[#ff3b30] mt-1.5">{analytics.cancelledCount}</p>
              <p className="text-[11px] text-[#86868b] mt-0.5">
                -${analytics.cancelledRevenue.toFixed(0)} refunded
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Cancellation & FIFO Recovery Intelligence */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-black/8 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#1d1d1f] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#ff3b30]" />
              FIFO Inventory Protection
            </h3>
            <p className="text-xs text-[#86868b] mt-1">
              Automated inventory restoration upon customer order cancellation.
            </p>

            <div className="mt-5 space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#f5f5f7] border border-black/5 flex items-center justify-between">
                <span className="text-[#86868b]">Cancellation Policy</span>
                <span className="font-semibold text-[#1d1d1f]">4-Hour Window</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#f5f5f7] border border-black/5 flex items-center justify-between">
                <span className="text-[#86868b]">Restock Automation</span>
                <span className="font-semibold text-[#248a3d]">100% FIFO Queue Restored</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#f5f5f7] border border-black/5 flex items-center justify-between">
                <span className="text-[#86868b]">Inventory Deficit</span>
                <span className="font-semibold text-[#248a3d]">$0.00 Lost Stock</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#34c759]/10 border border-[#34c759]/20 text-xs text-[#248a3d]">
            <p className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#34c759]" />
              Zero Stock Leakage
            </p>
            <p className="text-[11px] text-[#86868b] mt-1">
              When a buyer cancels, items are immediately injected back into the earliest available batch without manual intervention.
            </p>
          </div>
        </div>
      </div>

      {/* TOP PROFITABLE PRODUCTS & CRITICAL LOW STOCK RADAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Top Profitable Products Leaderboard */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-black/8 shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-[#1d1d1f] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#248a3d]" />
                Top Profitable Products Leaderboard
              </h3>
              <p className="text-xs text-[#86868b]">Ranked by total net gross profit generated</p>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="text-xs text-[#0071e3] hover:underline font-semibold"
            >
              All Products →
            </button>
          </div>

          {analytics.topProducts.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#f5f5f7] border border-black/5 text-xs text-[#86868b]">
              No sales recorded yet. Once orders are placed, product profitability will populate here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-black/8 text-[#86868b] uppercase tracking-wider">
                    <th className="py-2.5 px-3 font-semibold">Product</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Sold</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Revenue</th>
                    <th className="py-2.5 px-3 font-semibold text-right text-[#248a3d]">Net Profit</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {analytics.topProducts.slice(0, 6).map((item, idx) => {
                    const margin = item.revenue > 0 ? (item.profit / item.revenue) * 100 : 0;
                    return (
                      <tr key={item.id} className="hover:bg-[#f5f5f7] transition">
                        <td className="py-3 px-3 font-medium text-[#1d1d1f] flex items-center gap-2.5">
                          <span className="w-5 text-center font-bold text-[#86868b] text-[11px]">
                            #{idx + 1}
                          </span>
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-8 h-8 rounded-lg object-cover bg-black/5 border border-black/8 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-black/5 border border-black/8 flex items-center justify-center text-[#86868b] font-bold text-[10px] shrink-0">
                              SKU
                            </div>
                          )}
                          <div className="truncate max-w-40 sm:max-w-xs">
                            <p className="truncate font-semibold text-[#1d1d1f]">{item.name}</p>
                            <p className="text-[10px] text-[#86868b]">{item.category}</p>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-semibold text-[#1d1d1f]">
                          {item.unitsSold}
                        </td>
                        <td className="py-3 px-3 text-right font-medium text-[#1d1d1f]">
                          ${item.revenue.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-[#248a3d]">
                          +${item.profit.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#34c759]/10 text-[#248a3d]">
                            {margin.toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Critical Low Stock Radar */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-black/8 shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-[#1d1d1f] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#ff9500]" />
                Low Stock Warning Radar
              </h3>
              <p className="text-xs text-[#86868b]">Items at or below safety threshold</p>
            </div>
            <button
              onClick={() => navigate('/products?filter=low')}
              className="text-xs text-[#0071e3] hover:underline font-semibold"
            >
              Filter ({lowStockCount}) →
            </button>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#f5f5f7] border border-black/5">
              <CheckCircle2 className="w-10 h-10 text-[#30d158] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#1d1d1f]">All Inventory Levels Safe</p>
              <p className="text-xs text-[#86868b] mt-1">
                Zero items require urgent purchase order creation.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {lowStockProducts.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-2xl bg-[#fbfbfd] border border-black/8 flex items-center justify-between hover:bg-[#f5f5f7] transition"
                >
                  <div className="flex items-center gap-2.5 truncate max-w-48 sm:max-w-64">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-9 h-9 rounded-xl object-cover bg-black/5 border border-black/8 shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-black/5 border border-black/8 flex items-center justify-center text-[#86868b] font-bold text-[10px] shrink-0">
                        SKU
                      </div>
                    )}
                    <div className="truncate">
                      <p className="text-xs font-semibold text-[#1d1d1f] truncate">{p.name}</p>
                      <p className="text-[10px] text-[#ff3b30] font-medium">
                        Only {p.quantity} units left (Min: {p.minStockLevel || 5})
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/products?edit=${p.id}`)}
                    className="px-3 py-1 rounded-full bg-[#1d1d1f] hover:bg-[#333336] text-white text-xs font-semibold shadow-xs transition active:scale-95 shrink-0"
                  >
                    Restock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
