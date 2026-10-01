import { useEffect, useState } from "react";
import {
    CreditCard,
    Banknote,
    ShoppingBag,
    ArrowLeft,
    Lock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { createOrder } from "../services/customerApi";

function Checkout() {

    const navigate = useNavigate();

    const {
        user,
        token
    } = useAuth();

    const [cart, setCart] = useState([]);

    const [paymentMethod, setPaymentMethod] =
        useState("CASH");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    // ==========================================
    // LOAD CART
    // ==========================================

    useEffect(() => {

        const savedCart =
            JSON.parse(
                localStorage.getItem("cart") || "[]"
            );

        setCart(savedCart);

    }, []);


    // ==========================================
    // CALCULATE TOTAL
    // ==========================================

    const total = cart.reduce(
        (sum, item) =>
            sum +
            Number(item.price) *
            Number(item.quantity),

        0
    );


    // ==========================================
    // PLACE ORDER
    // ==========================================

    const handleCheckout = async () => {

        setError("");


        // --------------------------------------
        // CHECK LOGIN
        // --------------------------------------

        if (!token || !user?.userId) {

            navigate("/login");

            return;
        }


        // --------------------------------------
        // CHECK CART
        // --------------------------------------

        if (cart.length === 0) {

            setError(
                "Your cart is empty."
            );

            return;
        }


        try {

            setLoading(true);


            // ----------------------------------
            // ORDER REQUEST
            // ----------------------------------

            const orderData = {

                userId: user.userId,

                notes:
                    `Payment method: ${paymentMethod}`,

                items: cart.map((item) => ({

                    productId: item.id,

                    quantity: item.quantity,

                })),

            };


            // ----------------------------------
            // SEND TO SPRING BOOT
            // ----------------------------------

            const order =
                await createOrder(
                    orderData,
                    token
                );


            // ----------------------------------
            // CLEAR CART
            // ----------------------------------

            localStorage.removeItem("cart");

            setCart([]);


            // ----------------------------------
            // GO TO ORDER SUCCESS
            // ----------------------------------

            navigate(
                `/order-success/${order.id}`
            );

        } catch (err) {

            console.error(
                "Checkout error:",
                err
            );

            const message =
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Checkout failed. Please try again.";

            setError(message);

        } finally {

            setLoading(false);

        }
    };


    // ==========================================
    // EMPTY CART
    // ==========================================

    if (cart.length === 0) {

        return (

            <div className="py-16">

                <div className="mx-auto max-w-2xl">

                    <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center">

                        <ShoppingBag
                            size={50}
                            className="mx-auto text-gray-300"
                        />

                        <h1 className="mt-5 text-2xl font-bold">
                            Your cart is empty
                        </h1>

                        <p className="mt-2 text-gray-500">
                            Add some products before checking out.
                        </p>

                        <button
                            onClick={() =>
                                navigate("/")
                            }
                            className="mt-6 rounded-xl bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800"
                        >
                            Continue Shopping
                        </button>

                    </div>

                </div>

            </div>

        );
    }


    // ==========================================
    // CHECKOUT PAGE
    // ==========================================

    return (

        <div className="py-8">

            <div className="mx-auto max-w-5xl">


                {/* ==================================
                    BACK BUTTON
                ================================== */}

                <button
                    onClick={() =>
                        navigate("/cart")
                    }
                    className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-black"
                >

                    <ArrowLeft size={18} />

                    Back to Cart

                </button>


                {/* ==================================
                    HEADER
                ================================== */}

                <div className="mb-8">

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">

                            <ShoppingBag size={20} />

                        </div>

                        <div>

                            <h1 className="text-3xl font-bold">
                                Checkout
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                Review your order before placing it.
                            </p>

                        </div>

                    </div>

                </div>


                {/* ==================================
                    MAIN GRID
                ================================== */}

                <div className="grid gap-6 lg:grid-cols-3">


                    {/* ==================================
                        PAYMENT
                    ================================== */}

                    <div className="lg:col-span-2">

                        <div className="rounded-2xl border border-gray-200 bg-white p-6">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">

                                    <CreditCard size={19} />

                                </div>

                                <div>

                                    <h2 className="font-bold">
                                        Payment Method
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Choose how you want to pay.
                                    </p>

                                </div>

                            </div>


                            {/* PAYMENT OPTIONS */}

                            <div className="mt-6 space-y-3">


                                {/* CASH */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        setPaymentMethod("CASH")
                                    }
                                    className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                                        paymentMethod === "CASH"
                                            ? "border-black bg-gray-50"
                                            : "border-gray-200 hover:bg-gray-50"
                                    }`}
                                >

                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">

                                        <Banknote size={20} />

                                    </div>

                                    <div className="flex-1">

                                        <p className="font-semibold">
                                            Cash on Delivery
                                        </p>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Pay when you receive your order.
                                        </p>

                                    </div>

                                    {paymentMethod === "CASH" && (

                                        <div className="h-4 w-4 rounded-full bg-black" />

                                    )}

                                </button>


                                {/* CARD */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        setPaymentMethod("CARD")
                                    }
                                    className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                                        paymentMethod === "CARD"
                                            ? "border-black bg-gray-50"
                                            : "border-gray-200 hover:bg-gray-50"
                                    }`}
                                >

                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">

                                        <CreditCard size={20} />

                                    </div>

                                    <div className="flex-1">

                                        <p className="font-semibold">
                                            Card
                                        </p>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Select card as your payment method.
                                        </p>

                                    </div>

                                    {paymentMethod === "CARD" && (

                                        <div className="h-4 w-4 rounded-full bg-black" />

                                    )}

                                </button>

                            </div>


                            {/* ERROR */}

                            {error && (

                                <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4">

                                    <p className="text-sm text-red-600">
                                        {error}
                                    </p>

                                </div>

                            )}

                        </div>

                    </div>


                    {/* ==================================
                        ORDER SUMMARY
                    ================================== */}

                    <div className="h-fit rounded-2xl border border-gray-200 bg-white p-6">

                        <h2 className="text-xl font-bold">
                            Order Summary
                        </h2>


                        {/* ITEMS */}

                        <div className="mt-5 space-y-4">

                            {cart.map((item) => (

                                <div
                                    key={item.id}
                                    className="flex items-center justify-between gap-4"
                                >

                                    <div className="flex min-w-0 items-center gap-3">

                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">

                                            {item.imageUrl ? (

                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    className="h-full w-full object-contain"
                                                />

                                            ) : (

                                                <ShoppingBag
                                                    size={20}
                                                    className="text-gray-400"
                                                />

                                            )}

                                        </div>

                                        <div className="min-w-0">

                                            <p className="truncate text-sm font-medium">
                                                {item.name}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-500">
                                                {item.quantity} × $
                                                {Number(
                                                    item.price
                                                ).toFixed(2)}
                                            </p>

                                        </div>

                                    </div>

                                    <p className="shrink-0 text-sm font-semibold">

                                        $
                                        {(
                                            Number(item.price) *
                                            Number(item.quantity)
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
                                    {total.toFixed(2)}
                                </span>

                            </div>

                        </div>


                        {/* PLACE ORDER */}

                        <button
                            type="button"
                            onClick={handleCheckout}
                            disabled={loading}
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-4 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                            {loading ? (

                                "Processing..."

                            ) : (

                                <>
                                    <Lock size={17} />

                                    {token
                                        ? "Place Order"
                                        : "Sign In to Place Order"}
                                </>

                            )}

                        </button>


                        <p className="mt-4 text-center text-xs text-gray-400">

                            Your stock will be verified again when you place the order.

                        </p>

                    </div>

                </div>

            </div>

        </div>

    );
}

export default Checkout;