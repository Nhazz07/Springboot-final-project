import { useEffect, useState } from "react";
import {
    Package,
    Eye,
    RefreshCw,
    ShoppingBag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getPurchaseHistory } from "../services/customerApi";

function PurchaseHistory() {
    const navigate = useNavigate();
    const { user, token } = useAuth();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadOrders = async () => {
        if (!user?.userId || !token) {
            setError(
                "Please sign in to view your purchase history."
            );

            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const data = await getPurchaseHistory(
                user.userId,
                token
            );

            setOrders(data || []);
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

    const getStatusStyle = (status) => {
        switch (status) {
            case "PENDING":
                return "bg-yellow-50 text-yellow-700";

            case "PROCESSING":
                return "bg-blue-50 text-blue-700";

            case "COMPLETED":
                return "bg-green-50 text-green-700";

            case "CANCELLED":
                return "bg-red-50 text-red-700";

            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    return (
        <div className="py-6">

            {/* HEADER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                <div>
                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
                            <ShoppingBag size={20} />
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Purchase History
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                View your previous orders.
                            </p>
                        </div>

                    </div>
                </div>

                <button
                    onClick={loadOrders}
                    disabled={loading}
                    className="flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium transition hover:bg-gray-50 disabled:opacity-50"
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

            {/* LOADING */}
            {loading && (
                <div className="mt-8 grid gap-4">

                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="h-28 animate-pulse rounded-2xl bg-gray-100"
                        />
                    ))}

                </div>
            )}

            {/* ERROR */}
            {!loading && error && (
                <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6 text-center">

                    <p className="text-sm text-red-600">
                        {error}
                    </p>

                </div>
            )}

            {/* EMPTY */}
            {!loading &&
                !error &&
                orders.length === 0 && (
                    <div className="mt-8 flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-gray-200 bg-white text-center">

                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                            <Package
                                size={38}
                                className="text-gray-400"
                            />
                        </div>

                        <h2 className="mt-5 text-xl font-bold">
                            No purchases yet
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            Your completed orders will appear here.
                        </p>

                        <button
                            onClick={() => navigate("/")}
                            className="mt-6 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                        >
                            Start Shopping
                        </button>

                    </div>
                )}

            {/* ORDERS */}
            {!loading &&
                !error &&
                orders.length > 0 && (
                    <div className="mt-8 space-y-4">

                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:shadow-sm"
                            >

                                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                                    {/* ORDER INFO */}
                                    <div className="flex items-center gap-4">

                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                                            <Package
                                                size={22}
                                                className="text-gray-500"
                                            />
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                                                Order
                                            </p>

                                            <h2 className="mt-1 font-bold">
                                                {order.orderNumber}
                                            </h2>

                                            {order.createdAt && (
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {new Date(
                                                        order.createdAt
                                                    ).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>

                                    </div>

                                    {/* STATUS */}
                                    <span
                                        className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                                            order.status
                                        )}`}
                                    >
                                        {order.status}
                                    </span>

                                    {/* TOTAL */}
                                    <div>
                                        <p className="text-xs text-gray-400">
                                            Total
                                        </p>

                                        <p className="mt-1 text-xl font-bold">
                                            $
                                            {Number(
                                                order.totalAmount
                                            ).toFixed(2)}
                                        </p>
                                    </div>

                                    {/* VIEW */}
                                    <button
                                        onClick={() =>
                                            navigate(
                                                `/order-success/${order.id}`
                                            )
                                        }
                                        className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium transition hover:bg-gray-50"
                                    >
                                        <Eye size={17} />
                                        View Order
                                    </button>

                                </div>

                            </div>
                        ))}

                    </div>
                )}

        </div>
    );
}

export default PurchaseHistory;