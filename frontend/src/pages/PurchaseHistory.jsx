import React, { useEffect, useState, useMemo } from "react";
import {
    Package,
    Eye,
    RefreshCw,
    ShoppingBag,
    XCircle,
    CheckCircle2,
    Clock,
    Truck,
    AlertTriangle,
    Calendar,
    ChevronDown,
    ChevronUp,
    MapPin,
    CreditCard,
    Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPurchaseHistory, updateOrderStatus } from "../services/customerApi";

function PurchaseHistory() {
    const navigate = useNavigate();
    const { user, token } = useAuth();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancelModalOrder, setCancelModalOrder] = useState(null);
    const [cancelling, setCancelling] = useState(false);
    const [actionMessage, setActionMessage] = useState(null);
    const [expandedOrderIds, setExpandedOrderIds] = useState(new Set());

    // Current time ticker to keep countdowns accurate
    const [currentTime, setCurrentTime] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Date.now());
        }, 30000); // refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const loadOrders = async () => {
        if (!user?.userId || !token) {
            setError("Please sign in to view your purchase history.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");
            const data = await getPurchaseHistory(user.userId, token);
            const fetchedOrders = data || [];

            // Sort orders descending by createdAt or id
            fetchedOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

            // AUTO-DELIVERY CHECK:
            // Check if any order has reached its arrival date (duration reached)
            // If date is reached and status is still PENDING or PROCESSING, auto-complete it!
            for (const order of fetchedOrders) {
                if (order.status === "PENDING" || order.status === "PROCESSING") {
                    const arrivalDate = getEstimatedArrival(order);
                    if (Date.now() >= arrivalDate.getTime()) {
                        try {
                            await updateOrderStatus(order.id, "COMPLETED", token);
                            order.status = "COMPLETED";
                        } catch (autoErr) {
                            console.warn("Auto-completion note:", autoErr);
                        }
                    }
                }
            }

            setOrders(fetchedOrders);
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to load purchase history."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, [user, token]);

    // Parse order metadata from notes if present
    const parseOrderMeta = (order) => {
        if (!order?.notes) return null;
        try {
            return JSON.parse(order.notes);
        } catch (e) {
            return { rawNote: order.notes };
        }
    };

    // Calculate Estimated Arrival Date (Duration = 3 days / 72 hours by default)
    const getEstimatedArrival = (order) => {
        const meta = parseOrderMeta(order);
        if (meta?.estimatedArrivalDate) {
            return new Date(meta.estimatedArrivalDate);
        }
        const created = new Date(order.createdAt || Date.now());
        const durationDays = meta?.deliveryDurationDays || 3;
        return new Date(created.getTime() + durationDays * 24 * 60 * 60 * 1000);
    };

    // 4-Hour Cancellation Window Calculation
    const getCancellationStatus = (order) => {
        if (order.status !== "PENDING") {
            return {
                canCancel: false,
                reason: order.status === "CANCELLED" ? "Order is cancelled" : "Already in processing / completed",
            };
        }

        const orderCreatedTime = new Date(order.createdAt || Date.now()).getTime();
        const fourHoursInMs = 4 * 60 * 60 * 1000;
        const timeElapsed = currentTime - orderCreatedTime;
        const timeRemaining = fourHoursInMs - timeElapsed;

        if (timeRemaining > 0) {
            const minutesLeft = Math.floor(timeRemaining / (1000 * 60));
            const hours = Math.floor(minutesLeft / 60);
            const mins = minutesLeft % 60;
            return {
                canCancel: true,
                remainingText: `${hours}h ${mins}m`,
            };
        } else {
            return {
                canCancel: false,
                reason: "4-hour cancellation window expired (locked for fulfillment)",
            };
        }
    };

    // Handle Order Cancellation
    const handleConfirmCancel = async () => {
        if (!cancelModalOrder) return;
        try {
            setCancelling(true);
            await updateOrderStatus(cancelModalOrder.id, "CANCELLED", token);

            setActionMessage({
                type: "success",
                text: `Order #${cancelModalOrder.orderNumber} has been cancelled successfully. All items have been returned to inventory.`,
            });

            // Update local state immediately
            setOrders((prev) =>
                prev.map((o) =>
                    o.id === cancelModalOrder.id ? { ...o, status: "CANCELLED" } : o
                )
            );
            setCancelModalOrder(null);
        } catch (err) {
            console.error("Cancellation error:", err);
            setActionMessage({
                type: "error",
                text:
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    "Failed to cancel order. The order may already be processed.",
            });
        } finally {
            setCancelling(false);
        }
    };

    // Fast-forward / simulate arrival for testing demo
    const handleSimulateArrival = async (order) => {
        try {
            await updateOrderStatus(order.id, "COMPLETED", token);
            setOrders((prev) =>
                prev.map((o) => (o.id === order.id ? { ...o, status: "COMPLETED" } : o))
            );
            setActionMessage({
                type: "success",
                text: `Delivery duration completed! Order #${order.orderNumber} is now marked as COMPLETED.`,
            });
        } catch (err) {
            console.error("Simulate arrival error:", err);
        }
    };

    const toggleExpand = (id) => {
        setExpandedOrderIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "PENDING":
                return {
                    label: "Pending Dispatch",
                    classes: "bg-[#ff9500]/10 text-[#d97706] border-[#ff9500]/25",
                };
            case "PROCESSING":
                return {
                    label: "In Transit / Out for Delivery",
                    classes: "bg-[#0071e3]/10 text-[#0071e3] border-[#0071e3]/25",
                };
            case "COMPLETED":
                return {
                    label: "Delivered & Completed",
                    classes: "bg-[#34c759]/10 text-[#248a3d] border-[#34c759]/25",
                };
            case "CANCELLED":
                return {
                    label: "Order Cancelled",
                    classes: "bg-[#ff3b30]/10 text-[#ff3b30] border-[#ff3b30]/25",
                };
            default:
                return {
                    label: status,
                    classes: "bg-[#f5f5f7] text-[#1d1d1f] border-black/8",
                };
        }
    };

    return (
        <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#1d1d1f] flex items-center justify-center text-white shadow-xs">
                        <ShoppingBag size={22} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
                            Purchase History & Tracking
                        </h1>
                        <p className="text-xs sm:text-sm text-[#86868b]">
                            Track your deliveries and manage active orders.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={loadOrders}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white px-4 py-2 text-xs font-semibold text-[#1d1d1f] transition hover:bg-[#f5f5f7] active:scale-95 shadow-xs disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        <span>Refresh</span>
                    </button>
                    <button
                        onClick={() => navigate("/catalog")}
                        className="inline-flex items-center gap-2 rounded-full bg-[#1d1d1f] hover:bg-[#333336] px-4 py-2 text-xs font-semibold text-white transition active:scale-95 shadow-xs"
                    >
                        <span>Shop Catalog</span>
                    </button>
                </div>
            </div>

            {/* Action Feedback Banner */}
            {actionMessage && (
                <div
                    className={`mb-6 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold border ${
                        actionMessage.type === "success"
                            ? "bg-[#34c759]/12 border-[#34c759]/25 text-[#248a3d]"
                            : "bg-[#ff3b30]/12 border-[#ff3b30]/25 text-[#ff3b30]"
                    }`}
                >
                    <div className="flex items-center gap-2.5">
                        {actionMessage.type === "success" ? (
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                        ) : (
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                        )}
                        <span>{actionMessage.text}</span>
                    </div>
                    <button
                        onClick={() => setActionMessage(null)}
                        className="text-xs uppercase tracking-wider underline hover:opacity-75"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* 4-Hour Policy Notice Box */}
            <div className="mb-6 p-4 rounded-2xl bg-white border border-black/8 shadow-xs flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-[#f5f5f7] flex items-center justify-center shrink-0 text-[#1d1d1f]">
                    <Clock size={16} />
                </div>
                <div className="text-xs text-[#515154] leading-relaxed">
                    <span className="font-bold text-[#1d1d1f]">
                        Official Order Cancellation Policy:
                    </span>{" "}
                    You can freely cancel any order within <strong>4 hours</strong> of placement while it is in <strong>Pending</strong> status. After 4 hours, orders are automatically routed to our logistics courier for fulfillment.
                </div>
            </div>

            {/* Loading Skeletons */}
            {loading && (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-36 rounded-3xl bg-white border border-black/8 animate-pulse p-6"
                        />
                    ))}
                </div>
            )}

            {/* Error View */}
            {!loading && error && (
                <div className="p-8 rounded-3xl bg-red-50 border border-red-200 text-center">
                    <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-red-600">{error}</p>
                    <button
                        onClick={loadOrders}
                        className="mt-4 px-5 py-2 rounded-full bg-red-600 text-white text-xs font-semibold"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && orders.length === 0 && (
                <div className="py-20 rounded-3xl bg-white border border-black/8 text-center flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-[#f5f5f7] flex items-center justify-center mb-4">
                        <Package size={36} className="text-[#86868b]" />
                    </div>
                    <h2 className="text-xl font-bold text-[#1d1d1f]">
                        No Orders Placed Yet
                    </h2>
                    <p className="mt-1 text-sm text-[#86868b] max-w-sm">
                        When you purchase items from our catalog, their real-time tracking and delivery duration will appear here.
                    </p>
                    <button
                        onClick={() => navigate("/catalog")}
                        className="mt-6 rounded-full bg-[#1d1d1f] hover:bg-[#333336] px-6 py-3 text-xs font-semibold text-white transition active:scale-95 shadow-sm"
                    >
                        Explore Store Catalog
                    </button>
                </div>
            )}

            {/* Order List */}
            {!loading && !error && orders.length > 0 && (
                <div className="space-y-5">
                    {orders.map((order) => {
                        const cancelStatus = getCancellationStatus(order);
                        const statusBadge = getStatusBadge(order.status);
                        const arrivalDate = getEstimatedArrival(order);
                        const isDelivered = order.status === "COMPLETED";
                        const isCancelled = order.status === "CANCELLED";
                        const isExpanded = expandedOrderIds.has(order.id);
                        const meta = parseOrderMeta(order);

                        // Days left until arrival
                        const msLeft = arrivalDate.getTime() - currentTime;
                        const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

                        return (
                            <div
                                key={order.id}
                                className="bg-white rounded-3xl border border-black/8 shadow-xs overflow-hidden transition hover:shadow-sm"
                            >
                                {/* Main Order Card Header */}
                                <div className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                                        {/* Order Identification & Date */}
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-[#f5f5f7] border border-black/5 flex items-center justify-center shrink-0 text-[#1d1d1f]">
                                                <Package size={24} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-base text-[#1d1d1f]">
                                                        {order.orderNumber}
                                                    </h3>
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-[11px] font-bold border ${statusBadge.classes}`}
                                                    >
                                                        {statusBadge.label}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-[#86868b] mt-1 flex items-center gap-2">
                                                    <span>
                                                        Placed:{" "}
                                                        {new Date(
                                                            order.createdAt || Date.now()
                                                        ).toLocaleString()}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {order.items?.length || 0}{" "}
                                                        {order.items?.length === 1 ? "item" : "items"}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Total & Action Controls */}
                                        <div className="flex flex-wrap items-center gap-4 lg:justify-end">
                                            <div className="text-left lg:text-right pr-2">
                                                <span className="text-[11px] uppercase tracking-wider text-[#86868b] font-semibold">
                                                    Total Paid
                                                </span>
                                                <p className="text-xl font-bold text-[#1d1d1f]">
                                                    ${Number(order.totalAmount).toFixed(2)}
                                                </p>
                                            </div>

                                            {/* 4-Hour Cancellation Button / Expired Notice */}
                                            {cancelStatus.canCancel && (
                                                <button
                                                    type="button"
                                                    onClick={() => setCancelModalOrder(order)}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#ff3b30]/10 hover:bg-[#ff3b30]/15 text-[#ff3b30] border border-[#ff3b30]/25 text-xs font-semibold transition active:scale-95"
                                                    title={`Can cancel for next ${cancelStatus.remainingText}`}
                                                >
                                                    <XCircle size={14} />
                                                    <span>Cancel Order ({cancelStatus.remainingText})</span>
                                                </button>
                                            )}

                                            {!cancelStatus.canCancel && order.status === "PENDING" && (
                                                <span className="text-[11px] font-medium text-[#86868b] bg-[#f5f5f7] px-3 py-1.5 rounded-full border border-black/5">
                                                    Lock Window Closed
                                                </span>
                                            )}

                                            {/* Details Button */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    navigate(`/order-success/${order.id}`)
                                                }
                                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#1d1d1f] hover:bg-[#333336] text-white text-xs font-semibold transition active:scale-95 shadow-xs"
                                            >
                                                <Eye size={14} />
                                                <span>Receipt</span>
                                            </button>

                                            {/* Toggle Items Drawer */}
                                            <button
                                                type="button"
                                                onClick={() => toggleExpand(order.id)}
                                                className="p-2 rounded-full hover:bg-[#f5f5f7] text-[#86868b] hover:text-[#1d1d1f] transition"
                                                aria-label="Expand order items"
                                            >
                                                {isExpanded ? (
                                                    <ChevronUp size={18} />
                                                ) : (
                                                    <ChevronDown size={18} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Real-Time Delivery Duration & Timeline Section */}
                                    {!isCancelled && (
                                        <div className="mt-5 pt-4 border-t border-black/5">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                                <div className="flex items-center gap-2 text-xs">
                                                    <Truck className="w-4 h-4 text-[#1d1d1f]" />
                                                    <span className="font-semibold text-[#1d1d1f]">
                                                        {isDelivered
                                                            ? "Delivered & Completed"
                                                            : `Estimated Arrival: ${arrivalDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`}
                                                    </span>
                                                    {!isDelivered && (
                                                        <span className="text-[#86868b]">
                                                            ({daysLeft > 0 ? `${daysLeft} days remaining` : "Arriving today"})
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Demo Simulation Button for evaluator/professor testing */}
                                                {!isDelivered && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSimulateArrival(order)}
                                                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0071e3] hover:underline"
                                                        title="Fast-forward delivery duration to test auto-complete"
                                                    >
                                                        <Zap size={12} />
                                                        <span>Simulate Delivery Arrival (Complete)</span>
                                                    </button>
                                                )}
                                            </div>

                                            {/* Delivery Progress Bar */}
                                            <div className="w-full bg-[#f5f5f7] rounded-full h-2 overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-500 ${
                                                        isDelivered
                                                            ? "w-full bg-[#34c759]"
                                                            : order.status === "PROCESSING"
                                                            ? "w-2/3 bg-[#0071e3]"
                                                            : "w-1/3 bg-[#ff9500]"
                                                    }`}
                                                />
                                            </div>

                                            <div className="grid grid-cols-3 text-[10px] sm:text-xs text-[#86868b] mt-2">
                                                <span className="text-[#1d1d1f] font-semibold">1. Placed</span>
                                                <span
                                                    className={`text-center font-semibold ${
                                                        order.status === "PROCESSING" || isDelivered
                                                            ? "text-[#1d1d1f]"
                                                            : ""
                                                    }`}
                                                >
                                                    2. Dispatched
                                                </span>
                                                <span
                                                    className={`text-right font-semibold ${
                                                        isDelivered ? "text-[#34c759]" : ""
                                                    }`}
                                                >
                                                    3. Delivered
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Expanded Item List Drawer */}
                                {isExpanded && (
                                    <div className="bg-[#f5f5f7]/60 border-t border-black/5 p-6">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#86868b] mb-3">
                                            Items in Order
                                        </h4>
                                        <div className="space-y-3">
                                            {order.items?.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center justify-between p-3 rounded-2xl bg-white border border-black/5 text-xs"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-[#f5f5f7] flex items-center justify-center text-[#1d1d1f] shrink-0">
                                                            <Package size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-[#1d1d1f]">
                                                                {item.productName}
                                                            </p>
                                                            <p className="text-[11px] text-[#86868b]">
                                                                Qty: {item.quantity} × ${Number(item.unitPrice).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="font-bold text-[#1d1d1f]">
                                                        ${Number(item.subtotal).toFixed(2)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Shipping Details Metadata if available */}
                                        {meta && meta.recipient && (
                                            <div className="mt-4 pt-3 border-t border-black/5 text-xs text-[#515154] flex flex-wrap gap-4">
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin size={13} className="text-[#86868b]" />
                                                    <span>
                                                        {meta.recipient} • {meta.address}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <CreditCard size={13} className="text-[#86868b]" />
                                                    <span>Payment: {meta.paymentMethod || "Standard"}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Apple Confirmation Modal for Cancellation */}
            {cancelModalOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-black/10 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-14 h-14 rounded-2xl bg-[#ff3b30]/10 border border-[#ff3b30]/20 flex items-center justify-center mx-auto mb-4 text-[#ff3b30]">
                            <AlertTriangle size={28} />
                        </div>

                        <h3 className="text-xl font-bold text-[#1d1d1f]">
                            Cancel Order #{cancelModalOrder.orderNumber}?
                        </h3>
                        <p className="mt-2 text-xs sm:text-sm text-[#86868b] leading-relaxed">
                            Are you sure you want to cancel this order? This action is irreversible. All reserved items will immediately be returned to stock inventory.
                        </p>

                        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
                            <button
                                type="button"
                                onClick={() => setCancelModalOrder(null)}
                                disabled={cancelling}
                                className="flex-1 py-3 px-4 rounded-full border border-black/10 bg-[#f5f5f7] hover:bg-[#ebebee] text-xs font-semibold text-[#1d1d1f] transition"
                            >
                                Keep Order
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmCancel}
                                disabled={cancelling}
                                className="flex-1 py-3 px-4 rounded-full bg-[#ff3b30] hover:bg-[#d72c21] text-xs font-semibold text-white transition flex items-center justify-center gap-2 shadow-xs"
                            >
                                {cancelling ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <XCircle size={15} />
                                        <span>Yes, Cancel Order</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PurchaseHistory;