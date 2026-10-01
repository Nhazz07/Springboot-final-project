import { useEffect, useState } from "react";
import {
    CheckCircle,
    Package,
    ArrowRight,
    ShoppingBag,
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
                const data = await getPurchaseById(
                    id,
                    token
                );

                setOrder(data);
            } catch (err) {
                console.error(err);

                setError(
                    err.response?.data?.message ||
                    "Unable to load order."
                );
            } finally {
                setLoading(false);
            }
        };

        loadOrder();
    }, [id, token]);

    if (loading) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">
                <p className="text-sm text-gray-500">
                    Loading order...
                </p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
                <Package
                    size={55}
                    className="text-gray-300"
                />

                <h2 className="mt-5 text-xl font-bold">
                    Unable to load order
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                    {error || "Order not found."}
                </p>

                <button
                    onClick={() => navigate("/")}
                    className="mt-6 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white"
                >
                    Back to Store
                </button>
            </div>
        );
    }

    return (
        <div className="py-10">

            <div className="mx-auto max-w-3xl">

                {/* SUCCESS HEADER */}
                <div className="text-center">

                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
                        <CheckCircle
                            size={48}
                            className="text-green-500"
                        />
                    </div>

                    <h1 className="mt-6 text-3xl font-bold tracking-tight">
                        Order Confirmed
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Thank you for your purchase!
                    </p>

                </div>

                {/* ORDER NUMBER */}
                <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 text-center">

                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                        Order Number
                    </p>

                    <p className="mt-2 text-2xl font-bold">
                        {order.orderNumber}
                    </p>

                    <div className="mt-4 flex items-center justify-center gap-2">

                        <span className="rounded-full bg-yellow-50 px-4 py-1.5 text-xs font-semibold text-yellow-700">
                            {order.status}
                        </span>

                    </div>

                </div>

                {/* ITEMS */}
                <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                            <ShoppingBag size={19} />
                        </div>

                        <div>
                            <h2 className="font-bold">
                                Order Items
                            </h2>

                            <p className="text-sm text-gray-500">
                                Items included in your order
                            </p>
                        </div>

                    </div>

                    <div className="mt-6 space-y-3">

                        {order.items?.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between rounded-xl border border-gray-100 p-4"
                            >

                                <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                                        <Package
                                            size={18}
                                            className="text-gray-400"
                                        />
                                    </div>

                                    <div>
                                        <p className="font-medium">
                                            {item.productName}
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            {item.quantity} × $
                                            {Number(
                                                item.unitPrice
                                            ).toFixed(2)}
                                        </p>
                                    </div>

                                </div>

                                <p className="font-semibold">
                                    $
                                    {Number(
                                        item.subtotal
                                    ).toFixed(2)}
                                </p>

                            </div>
                        ))}

                    </div>

                    {/* TOTAL */}
                    <div className="mt-6 border-t border-gray-200 pt-5">

                        <div className="flex items-center justify-between">

                            <span className="font-semibold">
                                Total
                            </span>

                            <span className="text-2xl font-bold">
                                $
                                {Number(
                                    order.totalAmount
                                ).toFixed(2)}
                            </span>

                        </div>

                    </div>

                </div>

                {/* ACTIONS */}
                <div className="mt-6 grid gap-3 sm:grid-cols-2">

                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-4 font-semibold transition hover:bg-gray-50"
                    >
                        <ShoppingBag size={18} />
                        Continue Shopping
                    </button>

                    <button
                        onClick={() =>
                            navigate("/purchase-history")
                        }
                        className="flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-4 font-semibold text-white transition hover:bg-gray-800"
                    >
                        Purchase History
                        <ArrowRight size={18} />
                    </button>

                </div>

            </div>
        </div>
    );
}

export default OrderSuccess;