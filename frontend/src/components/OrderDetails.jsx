import React, { useState, useEffect, useMemo } from "react";
import {
    X,
    Package,
    AlertTriangle,
    CreditCard,
    MapPin,
    Phone,
    User,
    Calendar,
    Truck,
    Clock,
    Printer,
    FileText,
    TrendingUp,
    Percent,
} from "lucide-react";
import { productService } from "../services/api";

function OrderDetails({
    order,
    onClose,
    onCancel,
    cancelling,
}) {
    if (!order) {
        return null;
    }

    // Load products catalog as fallback for cost price and images lookup
    const [products, setProducts] = useState([]);

    useEffect(() => {
        let isMounted = true;
        const loadProducts = async () => {
            try {
                const list = await productService.getAll();
                if (isMounted) setProducts(list || []);
            } catch (err) {
                console.warn("Could not load products for profit calculation:", err);
            }
        };
        loadProducts();
        return () => {
            isMounted = false;
        };
    }, []);

    const productMap = useMemo(() => {
        const map = new Map();
        products.forEach((p) => map.set(p.id, p));
        return map;
    }, [products]);

    const formatDate = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleString();
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "PENDING":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "PROCESSING":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "COMPLETED":
                return "bg-green-100 text-green-800 border-green-200";
            case "CANCELLED":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    // Parse user input metadata from order.notes
    const parseOrderMeta = () => {
        if (!order?.notes) return null;
        try {
            return JSON.parse(order.notes);
        } catch (e) {
            return { rawNote: order.notes };
        }
    };

    const meta = parseOrderMeta();

    // Calculate item-level and order-level financial metrics
    const itemsData = useMemo(() => {
        if (!order?.items) return [];
        return order.items.map((item) => {
            const prod = productMap.get(item.productId);
            const imageUrl = item.imageUrl || prod?.imageUrl || null;
            const unitPrice = Number(item.unitPrice) || 0;
            const quantity = Number(item.quantity) || 1;
            const revenue = Number(item.subtotal) || unitPrice * quantity;
            const costPrice =
                item.costPrice != null
                    ? Number(item.costPrice)
                    : prod?.costPrice != null
                    ? Number(prod.costPrice)
                    : 0;
            const totalCost = costPrice * quantity;
            const profit = Math.max(0, revenue - totalCost);
            const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

            return {
                ...item,
                imageUrl,
                unitPrice,
                quantity,
                revenue,
                costPrice,
                totalCost,
                profit,
                margin,
            };
        });
    }, [order?.items, productMap]);

    const orderFinancials = useMemo(() => {
        const totalRevenue =
            Number(order.totalAmount) ||
            itemsData.reduce((acc, it) => acc + it.revenue, 0);
        const totalCost = itemsData.reduce((acc, it) => acc + it.totalCost, 0);
        const netProfit = Math.max(0, totalRevenue - totalCost);
        const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

        return {
            totalRevenue,
            totalCost,
            netProfit,
            margin,
        };
    }, [order.totalAmount, itemsData]);

    const canCancel = order.status === "PENDING";

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            {/* Global Print Media Rules for Crisp, Ink-Saving Customer Invoices */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-receipt-card,
                    #printable-receipt-card * {
                        visibility: visible;
                    }
                    #printable-receipt-card {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100% !important;
                        max-width: 100% !important;
                        max-height: none !important;
                        box-shadow: none !important;
                        border: none !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        background: white !important;
                        overflow: visible !important;
                    }
                    .hide-on-print,
                    .hide-on-print * {
                        display: none !important;
                    }
                }
            `}</style>

            <div
                id="printable-receipt-card"
                className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl border border-black/10 animate-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-black/8 px-6 py-5 bg-[#fafafa]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#1d1d1f] text-white flex items-center justify-center shadow-xs">
                            <FileText size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-[#86868b]">
                                Official Order Receipt & Audit
                            </p>
                            <h2 className="text-lg font-bold text-[#1d1d1f]">
                                {order.orderNumber}
                            </h2>
                        </div>
                    </div>

                    {/* Header Action Buttons (Hidden on Print) */}
                    <div className="flex items-center gap-2 hide-on-print">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-black/10 bg-white hover:bg-[#f5f5f7] text-xs font-semibold text-[#1d1d1f] transition shadow-xs active:scale-95"
                            title="Print Customer Receipt"
                        >
                            <Printer size={14} />
                            <span>Print Receipt</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="rounded-full p-2 text-[#86868b] hover:bg-black/5 hover:text-[#1d1d1f] transition"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Main Scrollable Receipt Content */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                    {/* Top Status & Core Attributes */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 p-4 rounded-2xl bg-[#f5f5f7] border border-black/5 text-xs">
                        <div>
                            <p className="text-[#86868b] uppercase font-semibold text-[10px]">
                                Account Username
                            </p>
                            <p className="mt-1 font-bold text-[#1d1d1f] truncate">
                                {order.username || "Guest User"}
                            </p>
                        </div>

                        <div>
                            <p className="text-[#86868b] uppercase font-semibold text-[10px]">
                                Order Status
                            </p>
                            <span
                                className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${getStatusStyle(
                                    order.status
                                )}`}
                            >
                                {order.status}
                            </span>
                        </div>

                        <div>
                            <p className="text-[#86868b] uppercase font-semibold text-[10px]">
                                Date Placed
                            </p>
                            <p className="mt-1 font-medium text-[#1d1d1f]">
                                {formatDate(order.createdAt)}
                            </p>
                        </div>

                        <div>
                            <p className="text-[#86868b] uppercase font-semibold text-[10px]">
                                Customer ID
                            </p>
                            <p className="mt-1 font-medium text-[#1d1d1f]">
                                #{order.userId}
                            </p>
                        </div>
                    </div>

                    {/* Admin Financial Profit Intelligence Banner (Hidden on Print) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#fbfbfd] border border-black/8 text-xs hide-on-print shadow-xs">
                        <div>
                            <span className="text-[#86868b] uppercase tracking-wider font-semibold text-[10px]">
                                Order Revenue
                            </span>
                            <p className="text-lg font-bold text-[#1d1d1f] mt-0.5">
                                ${orderFinancials.totalRevenue.toFixed(2)}
                            </p>
                        </div>

                        <div>
                            <span className="text-[#86868b] uppercase tracking-wider font-semibold text-[10px]">
                                Cost of Goods
                            </span>
                            <p className="text-lg font-medium text-[#86868b] mt-0.5">
                                ${orderFinancials.totalCost.toFixed(2)}
                            </p>
                        </div>

                        <div>
                            <span className="text-[#248a3d] uppercase tracking-wider font-semibold text-[10px] flex items-center gap-1">
                                <TrendingUp size={12} />
                                Net Profit
                            </span>
                            <p className="text-lg font-extrabold text-[#248a3d] mt-0.5">
                                +${orderFinancials.netProfit.toFixed(2)}
                            </p>
                        </div>

                        <div>
                            <span className="text-[#0071e3] uppercase tracking-wider font-semibold text-[10px] flex items-center gap-1">
                                <Percent size={12} />
                                Gross Margin
                            </span>
                            <p className="text-lg font-extrabold text-[#0071e3] mt-0.5">
                                {orderFinancials.margin.toFixed(1)}%
                            </p>
                        </div>
                    </div>

                    {/* Customer Checkout & Payment Details */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#86868b] mb-3 flex items-center gap-1.5">
                            <CreditCard size={15} className="text-[#1d1d1f]" />
                            <span>Customer Payment & Shipping Process Info</span>
                        </h3>

                        {meta &&
                        (meta.recipient || meta.address || meta.paymentMethod) ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-white border border-black/8 text-xs">
                                {/* Shipping Recipient */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5 font-bold text-[#1d1d1f]">
                                        <User size={14} className="text-[#86868b]" />
                                        <span>Recipient: {meta.recipient || order.username}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[#515154]">
                                        <Phone size={14} className="text-[#86868b]" />
                                        <span>Tel: {meta.phone || "Not provided"}</span>
                                    </div>
                                    <div className="flex items-start gap-1.5 text-[#515154]">
                                        <MapPin
                                            size={14}
                                            className="text-[#86868b] shrink-0 mt-0.5"
                                        />
                                        <span>
                                            Delivery Address:{" "}
                                            {meta.address || "Standard Store Address"}
                                        </span>
                                    </div>
                                    {meta.city && (
                                        <div className="text-[11px] text-[#86868b] pl-5">
                                            City/Region:{" "}
                                            <span className="font-semibold text-[#1d1d1f]">
                                                {meta.city}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Payment & Delivery Method */}
                                <div className="space-y-1.5 sm:border-l sm:border-black/5 sm:pl-4">
                                    <div className="flex items-start gap-1.5 font-bold text-[#1d1d1f]">
                                        <CreditCard
                                            size={14}
                                            className="text-[#86868b] shrink-0 mt-0.5"
                                        />
                                        <div>
                                            <span>
                                                Payment:{" "}
                                                {meta.paymentMethod === "KHQR"
                                                    ? "ABA / KHQR Mobile Pay"
                                                    : meta.paymentMethod === "CARD"
                                                    ? "Credit / Debit Card"
                                                    : meta.paymentMethod === "CASH"
                                                    ? "Cash on Delivery (Doorstep)"
                                                    : meta.paymentMethod || "Standard"}
                                            </span>
                                            {meta.paymentMethod === "CARD" &&
                                                (meta.cardholder || meta.cardLast4) && (
                                                    <p className="text-[11px] font-normal text-[#6e6e73] mt-0.5">
                                                        {meta.cardholder
                                                            ? `Cardholder: ${meta.cardholder} • `
                                                            : ""}
                                                        {meta.cardLast4
                                                            ? `Card ending in •••• ${meta.cardLast4}`
                                                            : ""}
                                                        {meta.cardExpiry
                                                            ? ` (Exp: ${meta.cardExpiry})`
                                                            : ""}
                                                    </p>
                                                )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[#515154]">
                                        <Truck size={14} className="text-[#86868b]" />
                                        <span>
                                            Delivery Speed:{" "}
                                            {meta.deliverySpeed === "EXPRESS"
                                                ? "Priority Express (24 Hours - $2.50)"
                                                : "Standard Courier (3 Days - Free)"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[#515154]">
                                        <Clock size={14} className="text-[#86868b]" />
                                        <span>
                                            Est. Arrival:{" "}
                                            {meta.estimatedArrivalDate
                                                ? new Date(
                                                      meta.estimatedArrivalDate
                                                  ).toLocaleDateString("en-US", {
                                                      weekday: "short",
                                                      month: "short",
                                                      day: "numeric",
                                                  })
                                                : "3 Days from Placement"}
                                        </span>
                                    </div>
                                    {meta.instructions &&
                                        meta.instructions !== "None" && (
                                            <div className="pt-1 text-[#86868b]">
                                                <span className="font-semibold text-[#1d1d1f]">
                                                    Delivery Notes:
                                                </span>{" "}
                                                {meta.instructions}
                                            </div>
                                        )}
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 rounded-2xl bg-white border border-black/8 text-xs text-[#86868b]">
                                {order.notes ||
                                    "Standard checkout order (no custom shipping notes provided)."}
                            </div>
                        )}
                    </div>

                    {/* Ordered Items Table */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#86868b] flex items-center gap-1.5">
                                <Package size={15} className="text-[#1d1d1f]" />
                                <span>Ordered Items ({itemsData.length})</span>
                            </h3>
                            <span className="text-[11px] text-[#86868b] hide-on-print">
                                Financial metrics visible to admin only
                            </span>
                        </div>

                        <div className="rounded-2xl border border-black/8 overflow-hidden bg-white shadow-xs">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-[#f5f5f7] border-b border-black/8 text-[#86868b] font-semibold uppercase tracking-wider text-[11px]">
                                    <tr>
                                        {/* Product Photo Thumbnail (Img) - hidden on print */}
                                        <th className="px-4 py-3.5 hide-on-print w-16">Img</th>
                                        <th className="px-4 py-3.5">Product</th>
                                        <th className="px-4 py-3.5 text-center">Unit Price</th>
                                        <th className="px-4 py-3.5 text-center">Quantity</th>
                                        <th className="px-4 py-3.5 text-right">Revenue</th>
                                        {/* Internal Net Profit & Margin columns - hidden on print */}
                                        <th className="px-4 py-3.5 text-right text-[#248a3d] hide-on-print">
                                            Net Profit
                                        </th>
                                        <th className="px-4 py-3.5 text-right hide-on-print">
                                            Margin
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/5">
                                    {itemsData.map((item, idx) => (
                                        <tr
                                            key={item.id || item.productId || idx}
                                            className="hover:bg-[#fafafa] transition"
                                        >
                                            {/* Photo (Img) - hidden on print */}
                                            <td className="px-4 py-3 hide-on-print">
                                                {item.imageUrl ? (
                                                    <img
                                                        src={item.imageUrl}
                                                        alt={item.productName}
                                                        className="w-10 h-10 rounded-xl object-cover border border-black/8 bg-black/5 shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-xl bg-[#f5f5f7] border border-black/8 flex items-center justify-center text-[#86868b] font-bold text-[10px] shrink-0">
                                                        SKU
                                                    </div>
                                                )}
                                            </td>

                                            {/* Product Name */}
                                            <td className="px-4 py-3 font-semibold text-[#1d1d1f]">
                                                <p className="font-semibold text-xs text-[#1d1d1f]">
                                                    {item.productName}
                                                </p>
                                                <p className="text-[10px] text-[#86868b] font-mono">
                                                    ID: #{item.productId || "N/A"}
                                                </p>
                                            </td>

                                            {/* Unit Price */}
                                            <td className="px-4 py-3 text-center text-[#515154]">
                                                ${item.unitPrice.toFixed(2)}
                                            </td>

                                            {/* Quantity */}
                                            <td className="px-4 py-3 text-center font-bold text-[#1d1d1f]">
                                                {item.quantity}
                                            </td>

                                            {/* Revenue (Amount) */}
                                            <td className="px-4 py-3 text-right font-bold text-[#1d1d1f]">
                                                ${item.revenue.toFixed(2)}
                                            </td>

                                            {/* Net Profit - hidden on print */}
                                            <td className="px-4 py-3 text-right font-bold text-[#248a3d] hide-on-print">
                                                +${item.profit.toFixed(2)}
                                            </td>

                                            {/* Margin - hidden on print */}
                                            <td className="px-4 py-3 text-right hide-on-print">
                                                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#34c759]/10 text-[#248a3d]">
                                                    {item.margin.toFixed(0)}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer with Totals & Administrative Cancellation */}
                <div className="border-t border-black/8 bg-[#fafafa] px-6 py-5">
                    <div className="flex items-baseline justify-between mb-4">
                        <span className="text-sm font-semibold text-[#86868b]">
                            Grand Total
                        </span>
                        <div className="text-right">
                            <span className="text-2xl font-extrabold text-[#1d1d1f]">
                                ${Number(order.totalAmount).toFixed(2)}
                            </span>
                            <span className="block text-[11px] text-[#86868b]">
                                ~ ៛{(Number(order.totalAmount) * 4100).toLocaleString()}{" "}
                                KHR
                            </span>
                        </div>
                    </div>

                    {/* Cancel Warning if Pending (Hidden on Print) */}
                    {canCancel && (
                        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 hide-on-print">
                            <AlertTriangle
                                size={18}
                                className="shrink-0 text-red-500 mt-0.5"
                            />
                            <div>
                                <p className="font-bold">Pending Order Restock Policy</p>
                                <p className="mt-0.5 text-red-600">
                                    Cancelling this pending order will immediately return
                                    all items back into store inventory.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons (Hidden on Print) */}
                    <div className="flex gap-3 hide-on-print">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 rounded-full border border-black/10 bg-white hover:bg-[#f5f5f7] text-xs font-semibold text-[#1d1d1f] transition active:scale-95"
                        >
                            Close Receipt
                        </button>

                        {canCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={cancelling}
                                className="flex-1 py-3 px-4 rounded-full bg-[#ff3b30] hover:bg-[#d72c21] text-xs font-semibold text-white transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 active:scale-95"
                            >
                                {cancelling ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <span>Cancel Order & Restock</span>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderDetails;