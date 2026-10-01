import React, { useEffect, useState } from "react";
import {
    ArrowLeft,
    Minus,
    Plus,
    ShoppingCart,
    Package,
    ShieldCheck,
    Truck,
    RotateCcw,
    Check,
    Share2,
    Zap,
    Clock,
    Sparkles,
    Building2,
    CheckCircle2,
    AlertCircle,
    Info,
} from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProductById, getProducts } from "../services/customerApi";
import CartNotificationToast from "../components/common/CartNotificationToast";

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [toastProduct, setToastProduct] = useState(null);
    const [copied, setCopied] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    // Real-time cart state for live stock deduction
    const [cart, setCart] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("cart") || "[]");
        } catch (e) {
            return [];
        }
    });

    // Synchronize cart state on changes across app tabs or components
    useEffect(() => {
        const handleCartSync = () => {
            try {
                setCart(JSON.parse(localStorage.getItem("cart") || "[]"));
            } catch (e) {
                setCart([]);
            }
        };

        window.addEventListener("cart-updated", handleCartSync);
        window.addEventListener("storage", handleCartSync);
        return () => {
            window.removeEventListener("cart-updated", handleCartSync);
            window.removeEventListener("storage", handleCartSync);
        };
    }, []);

    useEffect(() => {
        const loadProduct = async () => {
            try {
                setLoading(true);
                setError("");
                let data = null;
                try {
                    data = await getProductById(id, token);
                } catch (apiErr) {
                    console.warn("Direct fetch by id failed, falling back to full catalog:", apiErr);
                    const list = await getProducts();
                    data = list?.find((item) => String(item.id) === String(id));
                }

                if (!data) {
                    throw new Error("Product not found in store catalog.");
                }
                setProduct(data);
                const initialImg = data.imageUrl || (data.images && data.images.length > 0 ? data.images[0] : null);
                setSelectedImage(initialImg);
            } catch (err) {
                console.error("Failed to load product:", err);
                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Product not found or unavailable."
                );
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [id, token]);

    // Calculate Estimated Arrival Date (3 business days from now)
    const getEstimatedDelivery = () => {
        const date = new Date();
        date.setDate(date.getDate() + 3);
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
        });
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    // Calculate live remaining stock
    const totalStock = product?.quantity || 0;
    const cartItem = cart.find((item) => String(item.id) === String(product?.id));
    const inCartQty = cartItem ? cartItem.quantity : 0;
    const availableStock = Math.max(0, totalStock - inCartQty);
    const stock = availableStock;
    const outOfStock = availableStock <= 0;
    const isLowStock = availableStock > 0 && availableStock <= 5;

    // Build consolidated list of all images saved in DB
    const allImages = Array.from(
        new Set(
            [product?.imageUrl, ...(product?.images || [])].filter(Boolean)
        )
    );
    const activeDisplayImage = selectedImage || product?.imageUrl || (allImages.length > 0 ? allImages[0] : null);

    const addToCart = (redirectCheckout = false) => {
        if (!product || availableStock <= 0 || quantity > availableStock) return;

        const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
        const existing = currentCart.find((item) => String(item.id) === String(product.id));

        if (existing) {
            existing.quantity = Math.min(
                existing.quantity + quantity,
                totalStock
            );
        } else {
            currentCart.push({
                id: product.id,
                name: product.name,
                price: Number(product.price),
                quantity,
                stock: totalStock,
                imageUrl: activeDisplayImage || product.imageUrl,
            });
        }

        localStorage.setItem("cart", JSON.stringify(currentCart));
        setCart(currentCart);
        window.dispatchEvent(new Event("cart-updated"));

        if (redirectCheckout) {
            navigate("/checkout");
        } else {
            setToastProduct({ ...product, addedQuantity: quantity });
        }
    };

    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center min-h-125">
                <div className="w-10 h-10 border-3 border-black/10 border-t-[#1d1d1f] rounded-full animate-spin mb-4" />
                <p className="text-sm font-medium text-[#86868b]">
                    Loading product details...
                </p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="py-20 flex min-h-125 flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-[#f5f5f7] flex items-center justify-center mb-5">
                    <Package size={36} className="text-[#86868b]" />
                </div>

                <h2 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">
                    Product Unavailable
                </h2>
                <p className="mt-2 text-sm text-[#86868b] max-w-md">
                    {error || "We could not find the product you requested."}
                </p>

                <button
                    onClick={() => navigate("/catalog")}
                    className="mt-6 rounded-full bg-[#1d1d1f] hover:bg-[#333336] px-6 py-3 text-sm font-semibold text-white transition active:scale-95 shadow-sm"
                >
                    Back to Catalog
                </button>
            </div>
        );
    }

    return (
        <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Top Navigation & Breadcrumbs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-2 text-xs font-medium text-[#86868b]">
                    <Link
                        to="/"
                        className="hover:text-[#1d1d1f] transition flex items-center gap-1.5"
                    >
                        Store
                    </Link>
                    <span>/</span>
                    <Link
                        to="/catalog"
                        className="hover:text-[#1d1d1f] transition"
                    >
                        Catalog
                    </Link>
                    <span>/</span>
                    <span className="text-[#1d1d1f] font-semibold truncate max-w-xs">
                        {product.name}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleShare}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#f5f5f7] border border-black/8 text-xs font-semibold text-[#1d1d1f] transition active:scale-95 shadow-xs"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-[#34c759]" />
                                <span className="text-[#34c759]">Link Copied!</span>
                            </>
                        ) : (
                            <>
                                <Share2 className="w-3.5 h-3.5 text-[#86868b]" />
                                <span>Share</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => navigate("/catalog")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#f5f5f7] border border-black/8 text-xs font-semibold text-[#86868b] hover:text-[#1d1d1f] transition active:scale-95 shadow-xs"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>All Products</span>
                    </button>
                </div>
            </div>

            {/* Main Showcase Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Left Column: Visual Showcase (6 cols) */}
                <div className="lg:col-span-6 xl:col-span-6 space-y-4">
                    {/* Primary Photo Showcase */}
                    <div className="relative overflow-hidden rounded-3xl bg-[#f5f5f7] border border-black/8 p-8 flex items-center justify-center min-h-115 sm:min-h-130 shadow-xs group">
                        {/* Status Pills */}
                        <div className="absolute top-5 left-5 z-10 flex flex-col gap-2">
                            {outOfStock ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#ff3b30]/10 border border-[#ff3b30]/20 text-[#ff3b30] text-xs font-semibold">
                                    {totalStock <= 0 ? "Sold Out" : "Cart Limit Reached"}
                                </span>
                            ) : isLowStock ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#ff9500]/10 border border-[#ff9500]/20 text-[#ff9500] text-xs font-semibold">
                                    Only {stock} Available {inCartQty > 0 ? `(${inCartQty} in cart)` : ""}
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#34c759]/10 border border-[#34c759]/20 text-[#248a3d] text-xs font-semibold">
                                    <span className="w-2 h-2 rounded-full bg-[#34c759] animate-pulse" />
                                    In Stock ({stock}) {inCartQty > 0 ? `• ${inCartQty} in cart` : ""}
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-black/5 text-[#1d1d1f] text-xs font-medium shadow-xs">
                                <Sparkles className="w-3 h-3 text-[#ff9500]" />
                                Genuine Product
                            </span>
                        </div>

                        {/* Image Preview */}
                        {activeDisplayImage ? (
                            <img
                                src={activeDisplayImage}
                                alt={product.name}
                                className="max-h-95 sm:max-h-110 w-auto max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-[#86868b]">
                                <Package size={90} className="stroke-[1.2] opacity-40 mb-3" />
                                <span className="text-xs uppercase tracking-wider font-semibold">
                                    No Image Available
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Image Thumbnails Gallery (If multiple photos uploaded in DB by Admin) */}
                    {allImages.length > 1 && (
                        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-1">
                            {allImages.map((img, idx) => {
                                const isSelected = activeDisplayImage === img;
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setSelectedImage(img)}
                                        className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-[#f5f5f7] border transition-all ${
                                            isSelected
                                                ? "border-[#1d1d1f] ring-2 ring-[#1d1d1f]/20 shadow-xs scale-102"
                                                : "border-black/8 hover:border-black/25 opacity-70 hover:opacity-100"
                                        }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`${product.name} photo ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Reassurance Badges */}
                    <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white border border-black/8 shadow-xs text-center">
                        <div className="flex flex-col items-center p-2">
                            <Truck className="w-5 h-5 text-[#1d1d1f] mb-1.5" />
                            <span className="text-xs font-semibold text-[#1d1d1f]">Fast Courier</span>
                            <span className="text-[10px] text-[#86868b]">Est. 3 Business Days</span>
                        </div>
                        <div className="flex flex-col items-center p-2 border-x border-black/5">
                            <ShieldCheck className="w-5 h-5 text-[#1d1d1f] mb-1.5" />
                            <span className="text-xs font-semibold text-[#1d1d1f]">Verified Source</span>
                            <span className="text-[10px] text-[#86868b]">{product.supplierName || "Standard Vendor"}</span>
                        </div>
                        <div className="flex flex-col items-center p-2">
                            <RotateCcw className="w-5 h-5 text-[#1d1d1f] mb-1.5" />
                            <span className="text-xs font-semibold text-[#1d1d1f]">Cancellation</span>
                            <span className="text-[10px] text-[#86868b]">4-Hour Free Cancel</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Product Detail & Purchase Engine (6 cols) */}
                <div className="lg:col-span-6 xl:col-span-6 space-y-6">
                    {/* Header & Title */}
                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2.5">
                            <span className="text-xs font-bold uppercase tracking-widest text-[#0071e3] bg-[#0071e3]/8 px-2.5 py-1 rounded-md">
                                {product.categoryName || "General Goods"}
                            </span>
                            {product.supplierName && (
                                <span className="inline-flex items-center gap-1 text-xs text-[#86868b] bg-[#f5f5f7] border border-black/5 px-2.5 py-1 rounded-md">
                                    <Building2 className="w-3 h-3 text-[#86868b]" />
                                    {product.supplierName}
                                </span>
                            )}
                            <span className="text-xs text-[#86868b] ml-auto font-mono">
                                SKU: IMS-{String(product.id).padStart(5, "0")}
                            </span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1d1f] leading-tight">
                            {product.name}
                        </h1>

                        {/* Real DB Inventory Status Tag */}
                        <div className="mt-3 flex items-center gap-2 text-xs">
                            <span className="inline-flex items-center gap-1.5 font-semibold text-[#248a3d] bg-[#34c759]/10 px-2.5 py-0.5 rounded-full border border-[#34c759]/20">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#34c759]" />
                                Real-Time Stock: {stock} Available
                            </span>
                            <span className="text-[#86868b]">
                                • Depleted via FIFO Queue
                            </span>
                        </div>
                    </div>

                    {/* Price Block */}
                    <div className="p-5 rounded-2xl bg-white border border-black/8 shadow-xs">
                        <div className="flex items-baseline gap-3">
                            <span className="text-4xl font-extrabold text-[#1d1d1f] tracking-tight">
                                ${Number(product.price).toFixed(2)}
                            </span>
                            <span className="text-sm font-medium text-[#86868b]">
                                ~ ៛{(Number(product.price) * 4100).toLocaleString()} KHR
                            </span>
                        </div>
                        <p className="text-xs text-[#86868b] mt-1.5">
                            All taxes included • Free standard courier delivery
                        </p>
                    </div>

                    {/* Product Overview (Strictly from DB as input by Admin) */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#86868b] flex items-center gap-1.5">
                                <Info className="w-3.5 h-3.5 text-[#0071e3]" />
                                Product Overview
                            </h3>
                            <span className="text-[11px] text-[#86868b]">
                                Official Store Description
                            </span>
                        </div>
                        {product.description && product.description.trim() ? (
                            <div className="p-4 rounded-2xl bg-[#fbfbfd] border border-black/8 text-sm leading-relaxed text-[#1d1d1f] whitespace-pre-line shadow-2xs font-normal">
                                {product.description}
                            </div>
                        ) : (
                            <div className="p-4 rounded-2xl bg-[#fbfbfd] border border-dashed border-black/10 text-xs text-[#86868b] italic flex items-center gap-2">
                                <Info className="w-4 h-4 text-[#86868b] shrink-0" />
                                <span>No overview or description was entered for this product.</span>
                            </div>
                        )}
                    </div>

                    {/* Delivery Estimate Box */}
                    <div className="p-4 rounded-2xl bg-[#f5f5f7] border border-black/8 flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 border border-black/5 shadow-xs">
                            <Clock className="w-5 h-5 text-[#1d1d1f]" />
                        </div>
                        <div className="text-xs">
                            <p className="font-semibold text-[#1d1d1f]">
                                Estimated Delivery: {getEstimatedDelivery()}
                            </p>
                            <p className="text-[#86868b] mt-0.5">
                                Orders placed today will be processed within 24 hours. Full tracking provided in your purchase history.
                            </p>
                        </div>
                    </div>

                    {/* Quantity & CTA Buttons */}
                    {!outOfStock ? (
                        <div className="space-y-4 pt-2">
                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-[#1d1d1f]">
                                    Quantity
                                </span>
                                <div className="flex items-center rounded-full border border-black/10 bg-white p-1 shadow-xs">
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={quantity <= 1}
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-[#1d1d1f] hover:bg-[#f5f5f7] transition disabled:opacity-30 disabled:cursor-not-allowed"
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="w-10 text-center font-bold text-sm text-[#1d1d1f]">
                                        {quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                                        disabled={quantity >= stock}
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-[#1d1d1f] hover:bg-[#f5f5f7] transition disabled:opacity-30 disabled:cursor-not-allowed"
                                        aria-label="Increase quantity"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => addToCart(false)}
                                    className="w-full py-4 px-6 rounded-full font-semibold text-sm text-white bg-[#1d1d1f] hover:bg-[#333336] transition-all duration-200 shadow-md shadow-black/15 flex items-center justify-center gap-2 active:scale-[0.98]"
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    <span>Add to Cart</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => addToCart(true)}
                                    className="w-full py-4 px-6 rounded-full font-semibold text-sm bg-[#0071e3]/10 hover:bg-[#0071e3]/15 text-[#0071e3] border border-[#0071e3]/30 transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                                >
                                    <Zap className="w-4 h-4" />
                                    <span>Buy Now</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 rounded-2xl bg-[#ff3b30]/10 border border-[#ff3b30]/20 text-center">
                            <p className="text-sm font-semibold text-[#ff3b30]">
                                {totalStock <= 0
                                    ? "This item is currently out of stock."
                                    : "You have reached the maximum available quantity for this product in your cart."}
                            </p>
                            <p className="text-xs text-[#86868b] mt-1">
                                {totalStock <= 0
                                    ? "Check back soon or contact support for restock updates."
                                    : `All ${totalStock} available units are reserved in your cart. You can complete your purchase at checkout.`}
                            </p>
                        </div>
                    )}

                </div>
            </div>

            {/* Added to Cart Notification Toast */}
            <CartNotificationToast
                product={toastProduct}
                onClose={() => setToastProduct(null)}
            />
        </div>
    );
}

export default ProductDetail;