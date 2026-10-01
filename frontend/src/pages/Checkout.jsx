import React, { useEffect, useState } from "react";
import {
    CreditCard,
    Banknote,
    ShoppingBag,
    ArrowLeft,
    Lock,
    QrCode,
    Truck,
    MapPin,
    Phone,
    User,
    CheckCircle2,
    ShieldCheck,
    Calendar,
    AlertCircle,
    Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../services/customerApi";

function Checkout() {
    const navigate = useNavigate();
    const { user, token } = useAuth();

    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Shipping Info Form State
    const [shippingInfo, setShippingInfo] = useState({
        fullName: user?.username || "",
        phoneNumber: "",
        address: "",
        city: "Phnom Penh",
        deliverySpeed: "STANDARD", // STANDARD (3 days, $0) | EXPRESS (1 day, $2.50)
        instructions: "",
    });

    // Payment Selection State
    const [paymentMethod, setPaymentMethod] = useState("KHQR"); // KHQR | CARD | CASH

    // Card Details Form State (for CARD method)
    const [cardDetails, setCardDetails] = useState({
        cardholderName: "",
        cardNumber: "",
        expiry: "",
        cvv: "",
    });

    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
        setCart(savedCart);
    }, []);

    // Calculate Subtotal & Shipping
    const subtotal = cart.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0
    );

    const shippingFee = shippingInfo.deliverySpeed === "EXPRESS" ? 2.5 : 0.0;
    const finalTotal = subtotal + shippingFee;
    const finalTotalKHR = Math.round(finalTotal * 4100);

    // Calculate Estimated Arrival Date
    const getEstimatedArrivalDate = (speed = shippingInfo.deliverySpeed) => {
        const date = new Date();
        const daysToAdd = speed === "EXPRESS" ? 1 : 3;
        date.setDate(date.getDate() + daysToAdd);
        return {
            formatted: date.toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
            }),
            days: daysToAdd,
            isoDate: date.toISOString(),
        };
    };

    const estimatedArrival = getEstimatedArrivalDate();

    // Place Order Handler
    const handleCheckout = async (e) => {
        if (e) e.preventDefault();
        setError("");

        // Check authentication
        if (!token || !user?.userId) {
            navigate("/login", { state: { from: { pathname: "/checkout" } } });
            return;
        }

        // Check cart emptiness
        if (cart.length === 0) {
            setError("Your cart is empty.");
            return;
        }

        // Validate shipping form
        if (!shippingInfo.fullName.trim()) {
            setError("Please provide your full recipient name.");
            return;
        }
        if (!shippingInfo.phoneNumber.trim()) {
            setError("Please provide a valid contact phone number.");
            return;
        }
        if (!shippingInfo.address.trim()) {
            setError("Please specify your delivery address.");
            return;
        }

        // Validate card if card payment selected
        if (paymentMethod === "CARD") {
            if (
                !cardDetails.cardNumber.trim() ||
                cardDetails.cardNumber.replace(/\s+/g, "").length < 15
            ) {
                setError("Please enter a valid 16-digit card number.");
                return;
            }
            if (!cardDetails.expiry.trim() || !cardDetails.cvv.trim()) {
                setError("Please enter card expiry date and CVV.");
                return;
            }
        }

        try {
            setLoading(true);

            // Construct structured order note with shipping, payment, and arrival metadata
            const orderPayloadNote = JSON.stringify({
                recipient: shippingInfo.fullName,
                phone: shippingInfo.phoneNumber,
                street: shippingInfo.address,
                city: shippingInfo.city,
                address: `${shippingInfo.address}, ${shippingInfo.city}`,
                paymentMethod: paymentMethod,
                deliverySpeed: shippingInfo.deliverySpeed,
                estimatedArrivalDate: estimatedArrival.isoDate,
                deliveryDurationDays: estimatedArrival.days,
                instructions: shippingInfo.instructions || "None",
                cardholder: paymentMethod === "CARD" ? cardDetails.cardholderName : undefined,
                cardLast4: paymentMethod === "CARD" ? cardDetails.cardNumber.replace(/\s+/g, "").slice(-4) : undefined,
                cardExpiry: paymentMethod === "CARD" ? cardDetails.expiry : undefined,
                subtotal: subtotal,
                shippingFee: shippingFee,
                total: finalTotal,
            });

            const orderData = {
                userId: user.userId,
                notes: orderPayloadNote,
                items: cart.map((item) => ({
                    productId: item.id,
                    quantity: item.quantity,
                })),
            };

            const order = await createOrder(orderData, token);

            // Clear cart & notify
            localStorage.removeItem("cart");
            window.dispatchEvent(new Event("cart-updated"));
            setCart([]);

            // Navigate to Order Confirmation / Tracking
            navigate(`/order-success/${order.id}`);
        } catch (err) {
            console.error("Checkout submission failed:", err);
            const message =
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to place order. Please review your stock and try again.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // If Cart is Empty
    if (cart.length === 0) {
        return (
            <div className="py-20 max-w-xl mx-auto px-4 text-center">
                <div className="w-20 h-20 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto mb-5">
                    <ShoppingBag size={36} className="text-[#86868b]" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f]">
                    Your Cart is Empty
                </h1>
                <p className="mt-2 text-sm text-[#86868b]">
                    Explore our products to add items before checking out.
                </p>
                <button
                    onClick={() => navigate("/catalog")}
                    className="mt-6 rounded-full bg-[#1d1d1f] hover:bg-[#333336] px-6 py-3 font-semibold text-sm text-white transition active:scale-95 shadow-sm"
                >
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Back Button */}
            <button
                onClick={() => navigate("/cart")}
                className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-[#86868b] hover:text-[#1d1d1f] transition"
            >
                <ArrowLeft size={16} />
                <span>Return to Cart</span>
            </button>

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#1d1d1f] flex items-center justify-center text-white shadow-xs">
                        <ShoppingBag size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f]">
                            Secure Checkout
                        </h1>
                        <p className="text-xs sm:text-sm text-[#86868b]">
                            Review delivery address, shipping speed, and payment method.
                        </p>
                    </div>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="mb-8 p-4 rounded-2xl bg-[#ff3b30]/10 border border-[#ff3b30]/20 flex items-center gap-3 text-sm text-[#ff3b30] font-medium">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Main Checkout Layout (2 Columns) */}
            <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Delivery Info & Payment (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                    {/* SECTION 1: Shipping & Delivery Address */}
                    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-black/8 shadow-xs">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-9 h-9 rounded-xl bg-[#f5f5f7] flex items-center justify-center text-[#1d1d1f]">
                                <MapPin size={18} />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-[#1d1d1f]">
                                    1. Shipping & Contact Information
                                </h2>
                                <p className="text-xs text-[#86868b]">
                                    Where should we deliver your order?
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1d1d1f] mb-1.5">
                                        Recipient Name *
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
                                        <input
                                            type="text"
                                            value={shippingInfo.fullName}
                                            onChange={(e) =>
                                                setShippingInfo({
                                                    ...shippingInfo,
                                                    fullName: e.target.value,
                                                })
                                            }
                                            placeholder="e.g. Mongkol Vichea"
                                            className="w-full rounded-xl border border-black/10 bg-[#f5f5f7] pl-10 pr-3.5 py-2.5 text-sm text-[#1d1d1f] outline-none focus:border-[#1d1d1f] transition"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1d1d1f] mb-1.5">
                                        Phone Number *
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
                                        <input
                                            type="tel"
                                            value={shippingInfo.phoneNumber}
                                            onChange={(e) =>
                                                setShippingInfo({
                                                    ...shippingInfo,
                                                    phoneNumber: e.target.value,
                                                })
                                            }
                                            placeholder="e.g. 012 345 678"
                                            className="w-full rounded-xl border border-black/10 bg-[#f5f5f7] pl-10 pr-3.5 py-2.5 text-sm text-[#1d1d1f] outline-none focus:border-[#1d1d1f] transition"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1d1d1f] mb-1.5">
                                        Street Address / House No. *
                                    </label>
                                    <input
                                        type="text"
                                        value={shippingInfo.address}
                                        onChange={(e) =>
                                            setShippingInfo({
                                                ...shippingInfo,
                                                address: e.target.value,
                                            })
                                        }
                                        placeholder="e.g. #144 St 51, BKK1"
                                        className="w-full rounded-xl border border-black/10 bg-[#f5f5f7] px-3.5 py-2.5 text-sm text-[#1d1d1f] outline-none focus:border-[#1d1d1f] transition"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1d1d1f] mb-1.5">
                                        City / Province
                                    </label>
                                    <select
                                        value={shippingInfo.city}
                                        onChange={(e) =>
                                            setShippingInfo({
                                                ...shippingInfo,
                                                city: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-xl border border-black/10 bg-[#f5f5f7] px-3 py-2.5 text-sm text-[#1d1d1f] outline-none focus:border-[#1d1d1f] transition"
                                    >
                                        <option value="Phnom Penh">Phnom Penh</option>
                                        <option value="Siem Reap">Siem Reap</option>
                                        <option value="Battambang">Battambang</option>
                                        <option value="Sihanoukville">Sihanoukville</option>
                                        <option value="Kampot">Kampot</option>
                                        <option value="Kandal">Kandal</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1d1d1f] mb-1.5">
                                    Delivery Note (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={shippingInfo.instructions}
                                    onChange={(e) =>
                                        setShippingInfo({
                                            ...shippingInfo,
                                            instructions: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. Call before arrival, leave at security desk"
                                    className="w-full rounded-xl border border-black/10 bg-[#f5f5f7] px-3.5 py-2.5 text-sm text-[#1d1d1f] outline-none focus:border-[#1d1d1f] transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Delivery Speed & Arrival Duration */}
                    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-black/8 shadow-xs">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-9 h-9 rounded-xl bg-[#f5f5f7] flex items-center justify-center text-[#1d1d1f]">
                                <Truck size={18} />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-[#1d1d1f]">
                                    2. Delivery Method & Estimated Arrival
                                </h2>
                                <p className="text-xs text-[#86868b]">
                                    Calculates order duration before status changes to completed.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {/* Standard Delivery */}
                            <div
                                onClick={() =>
                                    setShippingInfo({
                                        ...shippingInfo,
                                        deliverySpeed: "STANDARD",
                                    })
                                }
                                className={`cursor-pointer rounded-2xl p-4 border transition ${
                                    shippingInfo.deliverySpeed === "STANDARD"
                                        ? "border-[#1d1d1f] bg-[#f5f5f7] shadow-xs"
                                        : "border-black/8 hover:border-black/20 bg-white"
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-sm font-bold text-[#1d1d1f]">
                                        Standard Courier
                                    </span>
                                    <span className="text-xs font-bold text-[#34c759]">
                                        FREE
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-[#86868b]">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>Duration: 3 Business Days</span>
                                </div>
                                <p className="mt-2 text-xs font-semibold text-[#1d1d1f]">
                                    Arrives by {getEstimatedArrivalDate("STANDARD").formatted}
                                </p>
                            </div>

                            {/* Express Delivery */}
                            <div
                                onClick={() =>
                                    setShippingInfo({
                                        ...shippingInfo,
                                        deliverySpeed: "EXPRESS",
                                    })
                                }
                                className={`cursor-pointer rounded-2xl p-4 border transition ${
                                    shippingInfo.deliverySpeed === "EXPRESS"
                                        ? "border-[#1d1d1f] bg-[#f5f5f7] shadow-xs"
                                        : "border-black/8 hover:border-black/20 bg-white"
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-sm font-bold text-[#1d1d1f]">
                                        Priority Express
                                    </span>
                                    <span className="text-xs font-bold text-[#1d1d1f]">
                                        +$2.50
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-[#86868b]">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>Duration: 24 Hours / 1 Day</span>
                                </div>
                                <p className="mt-2 text-xs font-semibold text-[#1d1d1f]">
                                    Arrives by {getEstimatedArrivalDate("EXPRESS").formatted}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: Payment Process UI */}
                    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-black/8 shadow-xs">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-9 h-9 rounded-xl bg-[#f5f5f7] flex items-center justify-center text-[#1d1d1f]">
                                <CreditCard size={18} />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-[#1d1d1f]">
                                    3. Select Payment Method
                                </h2>
                                <p className="text-xs text-[#86868b]">
                                    All transactions are secured and encrypted.
                                </p>
                            </div>
                        </div>

                        {/* Payment Selector Tabs */}
                        <div className="grid grid-cols-3 gap-2.5 mb-6">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod("KHQR")}
                                className={`py-3 px-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                                    paymentMethod === "KHQR"
                                        ? "border-[#e02020] bg-[#e02020]/5 text-[#e02020] font-bold shadow-xs"
                                        : "border-black/8 hover:bg-[#f5f5f7] text-[#1d1d1f] font-medium"
                                }`}
                            >
                                <QrCode className="w-5 h-5" />
                                <span className="text-xs">ABA / KHQR</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setPaymentMethod("CARD")}
                                className={`py-3 px-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                                    paymentMethod === "CARD"
                                        ? "border-[#1d1d1f] bg-[#f5f5f7] text-[#1d1d1f] font-bold shadow-xs"
                                        : "border-black/8 hover:bg-[#f5f5f7] text-[#1d1d1f] font-medium"
                                }`}
                            >
                                <CreditCard className="w-5 h-5" />
                                <span className="text-xs">Credit Card</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setPaymentMethod("CASH")}
                                className={`py-3 px-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                                    paymentMethod === "CASH"
                                        ? "border-[#1d1d1f] bg-[#f5f5f7] text-[#1d1d1f] font-bold shadow-xs"
                                        : "border-black/8 hover:bg-[#f5f5f7] text-[#1d1d1f] font-medium"
                                }`}
                            >
                                <Banknote className="w-5 h-5" />
                                <span className="text-xs">Cash on Delivery</span>
                            </button>
                        </div>

                        {/* Payment Detail Content */}
                        {paymentMethod === "KHQR" && (
                            <div className="p-5 rounded-2xl bg-[#fafafa] border border-black/8">
                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    {/* Stylized KHQR QR Card */}
                                    <div className="w-44 bg-white p-3.5 rounded-2xl border-2 border-[#e02020] shadow-sm flex flex-col items-center text-center">
                                        <div className="bg-[#e02020] text-white text-[11px] font-extrabold tracking-widest px-3 py-0.5 rounded-md mb-2">
                                            KHQR
                                        </div>
                                        <div className="w-32 h-32 bg-[#f5f5f7] rounded-xl flex items-center justify-center p-2 relative">
                                            <QrCode className="w-full h-full text-[#1d1d1f]" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-7 h-7 bg-white rounded-lg shadow-sm border border-black/10 flex items-center justify-center text-[10px] font-bold text-[#e02020]">
                                                    ABA
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[11px] font-bold text-[#1d1d1f] mt-2">
                                            ${finalTotal.toFixed(2)}
                                        </span>
                                        <span className="text-[9px] text-[#86868b]">
                                            ~ ៛{finalTotalKHR.toLocaleString()} KHR
                                        </span>
                                    </div>

                                    {/* Instructions */}
                                    <div className="text-xs space-y-2 text-[#515154]">
                                        <p className="font-bold text-sm text-[#1d1d1f]">
                                            Scan with ABA Mobile or any Bakong App
                                        </p>
                                        <p>
                                            1. Open your banking app (ABA, Wing, ACLEDA, or Bakong).
                                        </p>
                                        <p>
                                            2. Scan this universal KHQR code to make an instant zero-fee payment.
                                        </p>
                                        <p>
                                            3. Click <strong>"Place Order"</strong> below once scanned to initiate processing.
                                        </p>
                                        <div className="pt-2 flex items-center gap-2 text-[11px] text-[#34c759] font-semibold">
                                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                                            <span>Instant payment verification enabled</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {paymentMethod === "CARD" && (
                            <div className="p-5 rounded-2xl bg-[#fafafa] border border-black/8 space-y-3.5">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1d1d1f] mb-1">
                                        Cardholder Name
                                    </label>
                                    <input
                                        type="text"
                                        value={cardDetails.cardholderName}
                                        onChange={(e) =>
                                            setCardDetails({
                                                ...cardDetails,
                                                cardholderName: e.target.value,
                                            })
                                        }
                                        placeholder="Full name as printed on card"
                                        className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#1d1d1f]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#1d1d1f] mb-1">
                                        Card Number
                                    </label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
                                        <input
                                            type="text"
                                            maxLength="19"
                                            value={cardDetails.cardNumber}
                                            onChange={(e) =>
                                                setCardDetails({
                                                    ...cardDetails,
                                                    cardNumber: e.target.value,
                                                })
                                            }
                                            placeholder="4111 2222 3333 4444"
                                            className="w-full rounded-xl border border-black/10 bg-white pl-10 pr-3.5 py-2.5 text-sm outline-none focus:border-[#1d1d1f] font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#1d1d1f] mb-1">
                                            Expiration (MM/YY)
                                        </label>
                                        <input
                                            type="text"
                                            maxLength="5"
                                            value={cardDetails.expiry}
                                            onChange={(e) =>
                                                setCardDetails({
                                                    ...cardDetails,
                                                    expiry: e.target.value,
                                                })
                                            }
                                            placeholder="12/28"
                                            className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#1d1d1f] font-mono"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#1d1d1f] mb-1">
                                            CVV Security Code
                                        </label>
                                        <input
                                            type="password"
                                            maxLength="4"
                                            value={cardDetails.cvv}
                                            onChange={(e) =>
                                                setCardDetails({
                                                    ...cardDetails,
                                                    cvv: e.target.value,
                                                })
                                            }
                                            placeholder="•••"
                                            className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#1d1d1f] font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {paymentMethod === "CASH" && (
                            <div className="p-5 rounded-2xl bg-[#fafafa] border border-black/8 text-xs text-[#515154] flex items-start gap-3">
                                <Banknote className="w-5 h-5 text-[#34c759] shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-sm text-[#1d1d1f]">
                                        Cash on Delivery (Doorstep Payment)
                                    </p>
                                    <p className="mt-1">
                                        Pay with cash in USD or Khmer Riel when the driver arrives at your delivery location. You may inspect the package before handing over the payment.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Order Summary & Confirmation (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-black/8 shadow-xs sticky top-24">
                        <h2 className="text-lg font-bold text-[#1d1d1f] mb-4">
                            Order Summary
                        </h2>

                        {/* Item List Preview */}
                        <div className="divide-y divide-black/5 max-h-72 overflow-y-auto pr-1">
                            {cart.map((item) => (
                                <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-12 h-12 rounded-xl bg-[#f5f5f7] p-1 flex items-center justify-center shrink-0 border border-black/5">
                                            {item.imageUrl ? (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    className="w-full h-full object-contain"
                                                />
                                            ) : (
                                                <ShoppingBag className="w-5 h-5 text-[#86868b]" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-[#1d1d1f] truncate">
                                                {item.name}
                                            </p>
                                            <p className="text-[11px] text-[#86868b] mt-0.5">
                                                Qty: {item.quantity} × ${Number(item.price).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-[#1d1d1f] shrink-0">
                                        ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Delivery Duration Callout */}
                        <div className="mt-4 p-3.5 rounded-2xl bg-[#f5f5f7] border border-black/5 flex items-center gap-3">
                            <Clock className="w-4 h-4 text-[#1d1d1f] shrink-0" />
                            <div className="text-xs">
                                <span className="font-semibold text-[#1d1d1f]">
                                    Estimated Delivery: {estimatedArrival.formatted}
                                </span>
                                <p className="text-[11px] text-[#86868b]">
                                    Order switches to Completed upon reaching arrival date.
                                </p>
                            </div>
                        </div>

                        {/* Cost Breakdown */}
                        <div className="mt-5 space-y-2 pt-4 border-t border-black/8 text-xs">
                            <div className="flex justify-between text-[#86868b]">
                                <span>Subtotal</span>
                                <span className="font-medium text-[#1d1d1f]">
                                    ${subtotal.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between text-[#86868b]">
                                <span>Shipping Fee</span>
                                <span className="font-medium text-[#1d1d1f]">
                                    {shippingFee === 0 ? "FREE" : `$${shippingFee.toFixed(2)}`}
                                </span>
                            </div>
                            <div className="flex justify-between text-base font-bold text-[#1d1d1f] pt-2 border-t border-black/5">
                                <span>Total Amount</span>
                                <div className="text-right">
                                    <span className="block">${finalTotal.toFixed(2)}</span>
                                    <span className="block text-[11px] font-normal text-[#86868b]">
                                        ~ ៛{finalTotalKHR.toLocaleString()} KHR
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Place Order CTA */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-6 py-4 px-6 rounded-full font-semibold text-sm text-white bg-[#1d1d1f] hover:bg-[#333336] transition-all duration-200 shadow-md shadow-black/15 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Lock size={16} />
                                    <span>
                                        {token
                                            ? `Place Order • $${finalTotal.toFixed(2)}`
                                            : "Sign In to Place Order"}
                                    </span>
                                </>
                            )}
                        </button>

                        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#86868b]">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#34c759]" />
                            <span>256-Bit SSL Encrypted & Protected Checkout</span>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default Checkout;