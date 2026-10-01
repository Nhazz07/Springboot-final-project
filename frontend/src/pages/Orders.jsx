import { useEffect, useState } from "react";
import {
    Eye,
    Package,
    RefreshCw,
} from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";
import {
    getOrders,
    getOrderById,
} from "../services/orderHistoryApi.js";

import OrderDetails from "../components/OrderDetails";

function Orders() {
    const { token } = useAuth();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // Selected Order

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // Load Orders

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

    useEffect(() => {
        loadOrders();
    }, [token]);

    // View Order Details

    const viewOrder = async (id) => {
        if (!token) {
            alert("Authentication token not found.");
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
                "Failed to load order details:",
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

    // Filter Orders

    const filteredOrders =
        statusFilter === "ALL"
            ? orders
            : orders.filter(
                (order) => order.status === statusFilter
            );

    // Format Date

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        return new Date(date).toLocaleString();
    };

    // Status Style

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

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Header */}

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

            {/* Main */}

            <main className="mx-auto max-w-7xl px-6 py-8">

                {/* Status Filters */}

                <div className="mb-6 flex flex-wrap gap-2">

                    {[
                        "ALL",
                        "PENDING",
                        "PROCESSING",
                        "COMPLETED",
                        "CANCELLED",
                    ].map((status) => (
                        <button
                            key={status}
                            onClick={() =>
                                setStatusFilter(status)
                            }
                            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                                statusFilter === status
                                    ? "bg-black text-white"
                                    : "bg-white text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            {status === "ALL"
                                ? "All"
                                : status.charAt(0) +
                                status
                                    .slice(1)
                                    .toLowerCase()}
                        </button>
                    ))}

                </div>

                {/* Loading */}

                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">

                        <RefreshCw
                            size={28}
                            className="mb-3 animate-spin"
                        />

                        <p>
                            Loading orders...
                        </p>

                    </div>
                )}

                {/* Error */}

                {!loading && error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600">

                        <p className="font-medium">
                            {error}
                        </p>

                        <button
                            onClick={loadOrders}
                            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                        >
                            Try Again
                        </button>

                    </div>
                )}

                {/* Empty */}

                {!loading &&
                    !error &&
                    filteredOrders.length === 0 && (
                        <div className="rounded-2xl border border-gray-200 bg-white py-20 text-center">

                            <Package
                                size={48}
                                className="mx-auto mb-4 text-gray-300"
                            />

                            <h2 className="text-lg font-semibold text-gray-700">
                                No orders found
                            </h2>

                            <p className="mt-1 text-sm text-gray-400">
                                There are no orders matching this filter.
                            </p>

                        </div>
                    )}

                {/* Orders */}

                {!loading &&
                    !error &&
                    filteredOrders.length > 0 && (
                        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                            {/* Table Header */}

                            <div className="hidden grid-cols-6 border-b bg-gray-50 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500 md:grid">

                                <span>
                                    Order
                                </span>

                                <span>
                                    Customer
                                </span>

                                <span>
                                    Items
                                </span>

                                <span>
                                    Total
                                </span>

                                <span>
                                    Status
                                </span>

                                <span className="text-right">
                                    Date
                                </span>

                            </div>

                            {/* Order Rows */}

                            <div className="divide-y divide-gray-100">

                                {filteredOrders.map(
                                    (order) => (

                                        <div
                                            key={order.id}
                                            className="grid gap-4 px-6 py-5 transition hover:bg-gray-50 md:grid-cols-6 md:items-center"
                                        >

                                            {/* Order Number */}

                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {
                                                        order.orderNumber
                                                    }
                                                </p>

                                                <p className="mt-1 text-xs text-gray-400">
                                                    ID:{" "}
                                                    {
                                                        order.id
                                                    }
                                                </p>
                                            </div>

                                            {/* Customer */}

                                            <div>
                                                <p className="text-sm font-medium text-gray-700">
                                                    {
                                                        order.username ||
                                                        "N/A"
                                                    }
                                                </p>

                                                <p className="text-xs text-gray-400">
                                                    User #
                                                    {
                                                        order.userId
                                                    }
                                                </p>
                                            </div>

                                            {/* Items */}

                                            <div>
                                                <p className="text-sm font-medium text-gray-700">
                                                    {
                                                        order
                                                            .items
                                                            ?.length ||
                                                        0
                                                    }{" "}
                                                    {
                                                        order
                                                            .items
                                                            ?.length ===
                                                        1
                                                            ? "item"
                                                            : "items"
                                                    }
                                                </p>
                                            </div>

                                            {/* Total */}

                                            <div>
                                                <p className="text-sm font-bold text-gray-900">
                                                    $
                                                    {Number(
                                                        order.totalAmount
                                                    ).toFixed(
                                                        2
                                                    )}
                                                </p>
                                            </div>

                                            {/* Status */}

                                            <div>
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                                                        order.status
                                                    )}`}
                                                >
                                                    {
                                                        order.status
                                                    }
                                                </span>
                                            </div>

                                            {/* Date + View */}

                                            <div className="flex items-center justify-between md:justify-end md:gap-4">

                                                <span className="text-sm text-gray-500">
                                                    {formatDate(
                                                        order.createdAt
                                                    )}
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        viewOrder(
                                                            order.id
                                                        )
                                                    }
                                                    disabled={
                                                        detailsLoading
                                                    }
                                                    className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                                                    title="View order"
                                                >
                                                    <Eye
                                                        size={
                                                            18
                                                        }
                                                    />
                                                </button>

                                            </div>

                                        </div>
                                    )
                                )}

                            </div>

                        </div>
                    )}

            </main>

            {/* Order Details */}

            {selectedOrder && (
                <OrderDetails
                    order={selectedOrder}
                    onClose={() =>
                        setSelectedOrder(null)
                    }
                />
            )}

        </div>
    );
}

export default Orders;