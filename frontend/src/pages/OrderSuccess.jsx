import React, { useEffect, useState } from "react";
import {
    CheckCircle,
    Package,
    ArrowRight,
    ShoppingBag,
    Clock,
    Truck,
    MapPin,
    CreditCard,
    Calendar,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPurchaseById } from "../services/customerApi";

function OrderSuccess() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadOrder = async () => {
            if (!token) {
                setError("Please login to view this order.");
                setLoading(false);
                return;
            }

            try {
                const data = await getPurchaseById(id, token);
                setOrder(data);
            } catch (err) {
                console.error(err);
                setError(
                    err.response?.data?.message ||
                    "Unable to load order details."
                );
            } finally {
                setLoading(false);
            }
        };

        loadOrder();
    }, [id, token]);

    // Parse Order Metadata
    const parseMeta = () => {
        if (!order?.notes) return null;
        try {
            return JSON.parse(order.notes);
        } catch (e) {
            return null;
        }
    };

    const meta = parseMeta();

    // Compute Arrival Date
    const getEstimatedArrival = () => {
        if (meta?.estimatedArrivalDate) {
            return new Date(meta.estimatedArrivalDate).toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
            });
        }
        const created = new Date(order?.createdAt || Date.now());
        created.setDate(created.getDate() + 3);
        return created.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="flex min-h-125 flex-col items-center justify-center">
                <div className="w-10 h-10 border-3 border-black/10 border-t-[#1d1d1f] rounded-full animate-spin mb-4" />
                <p className="text-sm font-medium text-[#86868b]">
                    Confirming order details...
                </p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="flex min-h-125 flex-col items-center justify-center text-center px-4">
                <div className="w-20 h-20 rounded-full bg-[#f5f5f7] flex items-center justify-center mb-4">
                    <Package size={36} className="text-[#86868b]" />
                </div>
                <h2 className="text-2xl font-bold text-[#1d1d1f]">
                    Unable to load order
                </h2>
                <p className="mt-2 text-sm text-[#86868b] max-w-md">
                    {error || "Order not found."}
                </p>
                <button
                    onClick={() => navigate("/")}
                    className="mt-6 rounded-full bg-[#1d1d1f] hover:bg-[#333336] px-6 py-3 text-xs font-semibold text-white transition active:scale-95 shadow-sm"
                >
                    Back to Store
                </button>
            </div>
        );
    }

    return (
        <div className="py-10 max-w-3xl mx-auto px-4 sm:px-6">
            {/* SUCCESS HEADER */}
            <div className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#34c759]/12 border border-[#34c759]/20">
                    <CheckCircle size={44} className="text-[#34c759]" />
                </div>
                <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-[#1d1d1f]">
                    Order Confirmed!
                </h1>
                <p className="mt-2 text-sm text-[#86868b]">
                    Thank you for your purchase. We are preparing your items for delivery.
                </p>
            </div>

            {/* ORDER INFO & STATUS CARD */}
            <div className="mt-8 rounded-3xl border border-black/8 bg-white p-6 sm:p-8 text-center shadow-xs">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#86868b]">
                    Order Reference Number
                </p>
                <p className="mt-2 text-2xl font-bold text-[#1d1d1f]">
                    {order.orderNumber}
                </p>
                <div className="mt-3 flex items-center justify-center gap-2">
                    <span className="rounded-full bg-[#ff9500]/10 border border-[#ff9500]/25 px-4 py-1 text-xs font-bold text-[#d97706]">
                        Status: {order.status}
                    </span>
                    <span className="text-xs text-[#86868b]">• Placed just now</span>
                </div>
            </div>

            {/* ESTIMATED DELIVERY DURATION TRACKING CARD */}
            <div className="mt-5 rounded-3xl border border-black/8 bg-white p-6 shadow-xs">
                <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center shrink-0">
                        <Truck size={22} />
                    </div>
                    <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <h3 className="font-bold text-base text-[#1d1d1f]">
                                Estimated Delivery: {getEstimatedArrival()}
                            </h3>
                            <span className="text-xs font-semibold text-[#0071e3] bg-[#0071e3]/8 px-2.5 py-0.5 rounded-full w-fit">
                                {meta?.deliverySpeed === "EXPRESS" ? "Priority Express (24h)" : "Standard Courier (3 Days)"}
                            </span>
                        </div>
                        <p className="text-xs text-[#86868b] mt-1 leading-relaxed">
                            Your order duration is actively tracked. Once the arrival date is reached, the status will automatically update to <strong>Completed / Delivered</strong>. You can cancel this order within the next 4 hours from your Purchase History.
                        </p>

                        {/* Progress Bar */}
                        <div className="mt-4 w-full bg-[#f5f5f7] rounded-full h-2 overflow-hidden">
                            <div className="h-full bg-[#0071e3] w-1/3 transition-all" />
                        </div>
                        <div className="grid grid-cols-3 text-[11px] text-[#86868b] mt-1.5 font-medium">
                            <span className="text-[#1d1d1f] font-bold">1. Order Placed</span>
                            <span className="text-center">2. In Transit</span>
                            <span className="text-right">3. Delivered</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* SHIPPING & PAYMENT DETAILS (IF METADATA PRESENT) */}
            {meta && (
                <div className="mt-5 rounded-3xl border border-black/8 bg-white p-6 shadow-xs">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#86868b] mb-4">
                        Delivery & Payment Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="p-3.5 rounded-2xl bg-[#f5f5f7] flex items-start gap-3">
                            <MapPin size={16} className="text-[#1d1d1f] mt-0.5 shrink-0" />
                            <div>
                                <p className="font-bold text-[#1d1d1f]">Delivery Address</p>
                                <p className="text-[#515154] mt-0.5">{meta.recipient}</p>
                                <p className="text-[#86868b]">{meta.address}</p>
                                <p className="text-[#86868b]">Tel: {meta.phone}</p>
                            </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-[#f5f5f7] flex items-start gap-3">
                            <CreditCard size={16} className="text-[#1d1d1f] mt-0.5 shrink-0" />
                            <div>
                                <p className="font-bold text-[#1d1d1f]">Payment Method</p>
                                <p className="text-[#515154] mt-0.5 font-semibold">
                                    {meta.paymentMethod === "KHQR"
                                        ? "ABA / KHQR Mobile Pay"
                                        : meta.paymentMethod === "CARD"
                                        ? "Credit / Debit Card"
                                        : "Cash on Delivery (Doorstep)"}
                                </p>
                                <p className="text-[#86868b] mt-1">
                                    Delivery speed: {meta.deliverySpeed || "Standard"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ORDER ITEMS */}
            <div className="mt-5 rounded-3xl border border-black/8 bg-white p-6 shadow-xs">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5f5f7] text-[#1d1d1f]">
                        <ShoppingBag size={18} />
                    </div>
                    <div>
                        <h2 className="font-bold text-sm text-[#1d1d1f]">
                            Ordered Items ({order.items?.length || 0})
                        </h2>
                    </div>
                </div>

                <div className="space-y-3 divide-y divide-black/5">
                    {order.items?.map((item) => (
                        <div
                            key={item.id}
                            className="pt-3 first:pt-0 flex items-center justify-between gap-4 text-xs"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f5f5f7] text-[#86868b]">
                                    <Package size={18} />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-[#1d1d1f] truncate">
                                        {item.productName}
                                    </p>
                                    <p className="mt-0.5 text-[#86868b]">
                                        {item.quantity} × ${Number(item.unitPrice).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                            <p className="font-bold text-[#1d1d1f]">
                                ${Number(item.subtotal).toFixed(2)}
                            </p>
                        </div>
                    ))}
                </div>

                {/* TOTAL */}
                <div className="mt-5 border-t border-black/8 pt-4 flex items-center justify-between">
                    <span className="font-bold text-sm text-[#1d1d1f]">
                        Total Amount
                    </span>
                    <span className="text-xl font-extrabold text-[#1d1d1f]">
                        ${Number(order.totalAmount).toFixed(2)}
                    </span>
                </div>
            </div>

            {/* ACTIONS */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <button
                    onClick={() => navigate("/catalog")}
                    className="flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3.5 text-xs font-semibold text-[#1d1d1f] transition hover:bg-[#f5f5f7] active:scale-95 shadow-xs"
                >
                    <ShoppingBag size={16} />
                    <span>Continue Shopping</span>
                </button>

                <button
                    onClick={() => navigate("/purchase-history")}
                    className="flex items-center justify-center gap-2 rounded-full bg-[#1d1d1f] hover:bg-[#333336] px-5 py-3.5 text-xs font-semibold text-white transition active:scale-95 shadow-sm"
                >
                    <span>View Purchase History & Cancellation</span>
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
}

export default OrderSuccess;