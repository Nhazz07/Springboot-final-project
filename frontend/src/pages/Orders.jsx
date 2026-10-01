import { useEffect, useState, useMemo } from "react";
import {
    Eye,
    Package,
    RefreshCw,
    Calendar,
    ArrowUpDown,
    CreditCard,
    Clock,
    Sparkles,
} from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";

import {
    getOrders,
    getOrderById,
    cancelOrder,
} from "../services/orderHistoryApi.js";

import OrderDetails from "../components/OrderDetails.jsx";

function Orders() {

    const { token } = useAuth();

    // Orders State
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [timeFilter, setTimeFilter] = useState("ALL"); // ALL, TODAY, WEEK, MONTH
    const [sortOption, setSortOption] = useState("NEWEST"); // NEWEST, OLDEST, HIGHEST, LOWEST

    // Selected Order State
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // Cancellation State
    const [cancelling, setCancelling] = useState(false);

    // Helper to safely parse order notes metadata
    const parseOrderMeta = (notes) => {
        if (!notes) return null;
        try {
            return JSON.parse(notes);
        } catch (e) {
            return null;
        }
    };

    // load order
    const loadOrders = async () => {
        if (!token) {
            setError("Authentication token not found.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");
            const data = await getOrders(token);
            setOrders(data || []);
        } catch (error) {
            console.error("Failed to load orders:", error);
            const message =
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Failed to load orders.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // load order when token changes
    useEffect(() => {
        loadOrders();
    }, [token]);

    // filter and sort orders (newest first by default, date dropdown filter)
    const filteredOrders = useMemo(() => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
        const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;

        return orders
            .filter((order) => {
                // Status Filter
                if (statusFilter !== "ALL" && order.status !== statusFilter) {
                    return false;
                }

                // Time Filter
                if (timeFilter !== "ALL") {
                    const orderTime = new Date(order.createdAt || 0).getTime();
                    if (timeFilter === "TODAY" && orderTime < startOfToday) {
                        return false;
                    }
                    if (timeFilter === "WEEK" && orderTime < sevenDaysAgo) {
                        return false;
                    }
                    if (timeFilter === "MONTH" && orderTime < thirtyDaysAgo) {
                        return false;
                    }
                }

                return true;
            })
            .sort((a, b) => {
                const dateA = new Date(a.createdAt || 0).getTime();
                const dateB = new Date(b.createdAt || 0).getTime();
                const amountA = Number(a.totalAmount || 0);
                const amountB = Number(b.totalAmount || 0);

                switch (sortOption) {
                    case "OLDEST":
                        return dateA - dateB;
                    case "HIGHEST":
                        return amountB - amountA;
                    case "LOWEST":
                        return amountA - amountB;
                    case "NEWEST":
                    default:
                        // Default: Newest one on top
                        if (dateB !== dateA) return dateB - dateA;
                        return (b.id || 0) - (a.id || 0);
                }
            });
    }, [orders, statusFilter, timeFilter, sortOption]);
    // view order details

    const viewOrder = async (id) => {

        if (!token) {

            alert(
                "Authentication token not found."
            );

            return;
        }

        try {

            setDetailsLoading(true);

            const order = await getOrderById(
                id,
                token
            );

            setSelectedOrder(order);

        } catch (error) {

            console.error(
                "Failed to load order:",
                error
            );

            const message =
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Failed to load order details.";

            alert(message);

        } finally {

            setDetailsLoading(false);
        }
    };

    // cancel order

    const handleCancelOrder = async () => {

        if (!selectedOrder) {
            return;
        }

        if (!token) {

            alert(
                "Authentication token not found."
            );

            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to cancel ${selectedOrder.orderNumber}?`
        );

        if (!confirmed) {
            return;
        }

        try {

            setCancelling(true);

            const updatedOrder =
                await cancelOrder(
                    selectedOrder.id,
                    token
                );

            // Update order inside modal
            setSelectedOrder(updatedOrder);

            // Refresh order history
            await loadOrders();

            alert(
                "Order cancelled successfully. Product stock has been restored."
            );

        } catch (error) {

            console.error(
                "Failed to cancel order:",
                error
            );

            const message =
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Failed to cancel order.";

            alert(message);

        } finally {

            setCancelling(false);
        }
    };


    // form data

    const formatDate = (date) => {

        if (!date) {
            return "N/A";
        }

        return new Date(
            date
        ).toLocaleString();
    };

    // status style

    const getStatusStyle = (status) => {

        switch (status) {

            case "PENDING":

                return "bg-yellow-100 text-yellow-700";

            case "COMPLETED":

                return "bg-green-100 text-green-700";

            case "CANCELLED":

                return "bg-red-100 text-red-700";

            case "PROCESSING":

                return "bg-blue-100 text-blue-700";

            default:

                return "bg-gray-100 text-gray-700";
        }
    };

           // ui

    return (

        <div className="min-h-screen bg-gray-50">
                  {/*header*/}

            <header className="border-b bg-white">

                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

                    <div>

                        <h1 className="text-2xl font-bold text-gray-900">
                            Orders
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            View and manage your orders.
                        </p>

                    </div>


                    {/* Refresh */}

                    <button
                        onClick={loadOrders}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                        <RefreshCw
                            size={17}
                            className={
                                loading
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Refresh

                    </button>

                </div>

            </header>


          {/*main*/}

            <main className="mx-auto max-w-7xl px-6 py-8">


             {/*status figure*/}

                {/* Status Tabs and Sort / Date Dropdown Controls */}
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* Status Filter Buttons */}
                    <div className="flex flex-wrap gap-2">
                        {[
                            "ALL",
                            "PENDING",
                            "PROCESSING",
                            "COMPLETED",
                            "CANCELLED",
                        ].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition ${
                                    statusFilter === status
                                        ? "bg-black text-white shadow-sm"
                                        : "bg-white text-gray-600 border border-gray-200/80 hover:bg-gray-100"
                                }`}
                            >
                                {status === "ALL"
                                    ? "All Statuses"
                                    : status.charAt(0) + status.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>

                    {/* Dropdown Filters: Date Filter + Sort */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Date Filter Dropdown */}
                        <div className="relative flex items-center">
                            <Calendar size={14} className="absolute left-3 text-gray-400 pointer-events-none" />
                            <select
                                value={timeFilter}
                                onChange={(e) => setTimeFilter(e.target.value)}
                                className="appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-8 pr-8 text-xs font-medium text-gray-700 shadow-xs focus:border-black focus:outline-hidden cursor-pointer"
                                aria-label="Filter orders by date"
                            >
                                <option value="ALL">All Time</option>
                                <option value="TODAY">Placed Today</option>
                                <option value="WEEK">This Week (Last 7 Days)</option>
                                <option value="MONTH">This Month</option>
                            </select>
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative flex items-center">
                            <ArrowUpDown size={14} className="absolute left-3 text-gray-400 pointer-events-none" />
                            <select
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                                className="appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-8 pr-8 text-xs font-medium text-gray-700 shadow-xs focus:border-black focus:outline-hidden cursor-pointer"
                                aria-label="Sort orders"
                            >
                                <option value="NEWEST">Newest on Top</option>
                                <option value="OLDEST">Oldest First</option>
                                <option value="HIGHEST">Highest Amount</option>
                                <option value="LOWEST">Lowest Amount</option>
                            </select>
                        </div>

                        <span className="text-xs text-gray-400 hidden lg:inline-block">
                            ({filteredOrders.length} {filteredOrders.length === 1 ? "order" : "orders"})
                        </span>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <RefreshCw size={28} className="mb-3 animate-spin" />
                        <p>Loading orders...</p>
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
                        <p className="font-medium">{error}</p>
                        <button
                            onClick={loadOrders}
                            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* No Orders */}
                {!loading && !error && filteredOrders.length === 0 && (
                    <div className="rounded-2xl border border-gray-200 bg-white py-20 text-center">
                        <Package size={48} className="mx-auto mb-4 text-gray-300" />
                        <h2 className="text-lg font-semibold text-gray-700">No orders found</h2>
                        <p className="mt-1 text-sm text-gray-400">
                            There are no orders matching this filter or time range.
                        </p>
                    </div>
                )}

                {/* Order Table */}
                {!loading && !error && filteredOrders.length > 0 && (
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        {/* Table Header */}
                        <div className="hidden grid-cols-6 border-b bg-gray-50 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500 md:grid">
                            <span>Order</span>
                            <span>Customer Info</span>
                            <span>Items & Method</span>
                            <span>Total</span>
                            <span>Status</span>
                            <span className="text-right">Date & Action</span>
                        </div>

                        {/* Order Rows */}
                        <div className="divide-y divide-gray-100">
                            {filteredOrders.map((order) => {
                                const meta = parseOrderMeta(order.notes);
                                return (
                                    <div
                                        key={order.id}
                                        className="grid gap-4 px-6 py-5 transition hover:bg-gray-50 md:grid-cols-6 md:items-center"
                                    >
                                        {/* Order */}
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">
                                                {order.orderNumber}
                                            </p>
                                            <p className="mt-0.5 text-xs text-gray-400">
                                                ID: #{order.id}
                                            </p>
                                        </div>

                                        {/* Customer Info (from checkout inputs or user profile) */}
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800 truncate">
                                                {meta?.recipient || order.username || "Customer"}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {meta?.phone ? `Tel: ${meta.phone}` : `User #${order.userId}`}
                                            </p>
                                        </div>

                                        {/* Items & Payment Badge */}
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">
                                                {order.items?.length || 0}{" "}
                                                {order.items?.length === 1 ? "item" : "items"}
                                            </p>
                                            {meta?.paymentMethod && (
                                                <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-700 mt-1">
                                                    <CreditCard size={10} />
                                                    {meta.paymentMethod}
                                                </span>
                                            )}
                                        </div>

                                        {/* Total */}
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">
                                                ${Number(order.totalAmount).toFixed(2)}
                                            </p>
                                        </div>

                                        {/* Status */}
                                        <div>
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                                                    order.status
                                                )}`}
                                            >
                                                {order.status}
                                            </span>
                                        </div>

                                        {/* Date + View Receipt Action */}
                                        <div className="flex items-center justify-between md:justify-end md:gap-3">
                                            <span className="text-xs text-gray-500">
                                                {formatDate(order.createdAt)}
                                            </span>

                                            <button
                                                onClick={() => viewOrder(order.id)}
                                                disabled={detailsLoading}
                                                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-xs transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                                title="View customer payment receipt & details"
                                            >
                                                <Eye size={14} />
                                                <span>Receipt</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

            </main>
            {/*order detail*/}

            {selectedOrder && (

                <OrderDetails
                    order={selectedOrder}
                    onClose={() =>
                        setSelectedOrder(null)
                    }
                    onCancel={
                        handleCancelOrder
                    }
                    cancelling={
                        cancelling
                    }
                />

            )}

        </div>
    );
}

export default Orders;