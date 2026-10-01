import { useEffect, useState } from "react";
import {
    ArrowLeft,
    Minus,
    Plus,
    Trash2,
    ShoppingCart,
    Package,
    CreditCard,
    AlertTriangle,
    X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function Cart() {
    const navigate = useNavigate();

    const [cart, setCart] = useState([]);
    const [deleteConfirmation, setDeleteConfirmation] = useState({
        isOpen: false,
        item: null,
    });

    useEffect(() => {
        const savedCart = JSON.parse(
            localStorage.getItem("cart") || "[]"
        );

        setCart(savedCart);
    }, []);

    const saveCart = (newCart) => {
        setCart(newCart);

        localStorage.setItem(
            "cart",
            JSON.stringify(newCart)
        );
        window.dispatchEvent(new Event("cart-updated"));
    };

    const increaseQuantity = (id) => {
        const newCart = cart.map((item) => {
            if (item.id !== id) {
                return item;
            }

            return {
                ...item,
                quantity: Math.min(
                    item.quantity + 1,
                    item.stock
                ),
            };
        });

        saveCart(newCart);
    };

    const decreaseQuantity = (id) => {
        const item = cart.find((i) => i.id === id);
        if (item && item.quantity === 1) {
            setDeleteConfirmation({ isOpen: true, item });
            return;
        }

        const newCart = cart
            .map((item) => {
                if (item.id !== id) {
                    return item;
                }

                return {
                    ...item,
                    quantity: item.quantity - 1,
                };
            })
            .filter((item) => item.quantity > 0);

        saveCart(newCart);
    };

    const removeItem = (id) => {
        const newCart = cart.filter(
            (item) => item.id !== id
        );

        saveCart(newCart);
    };

    const clearCart = () => {
        saveCart([]);
    };

    const confirmDelete = () => {
        if (deleteConfirmation.item) {
            removeItem(deleteConfirmation.item.id);
        } else {
            clearCart();
        }
        setDeleteConfirmation({ isOpen: false, item: null });
    };

    const totalItems = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const subtotal = cart.reduce(
        (total, item) =>
            total + Number(item.price) * item.quantity,
        0
    );

    const shipping = subtotal > 0 ? 0 : 0;

    const total = subtotal + shipping;

    return (
        <div className="py-6">

            {/* HEADER */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                <div>
                    <button
                        onClick={() => navigate("/")}
                        className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-black"
                    >
                        <ArrowLeft size={17} />
                        Continue Shopping
                    </button>

                    <div className="flex items-center gap-3">
                        <ShoppingCart size={28} />

                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Shopping Cart
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                {totalItems}{" "}
                                {totalItems === 1
                                    ? "item"
                                    : "items"}{" "}
                                in your cart
                            </p>
                        </div>
                    </div>
                </div>

                {cart.length > 0 && (
                    <button
                        onClick={() =>
                            setDeleteConfirmation({
                                isOpen: true,
                                item: null,
                            })
                        }
                        className="w-fit text-sm font-medium text-red-500 transition hover:text-red-700"
                    >
                        Clear Cart
                    </button>
                )}
            </div>

            {/* EMPTY CART */}
            {cart.length === 0 ? (
                <div className="flex min-h-112.5 flex-col items-center justify-center rounded-3xl border border-gray-200 bg-white px-6 text-center">

                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                        <ShoppingCart
                            size={36}
                            className="text-gray-400"
                        />
                    </div>

                    <h2 className="mt-6 text-2xl font-bold">
                        Your cart is empty
                    </h2>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                        Looks like you haven't added anything
                        to your cart yet.
                    </p>

                    <button
                        onClick={() => navigate("/")}
                        className="mt-6 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                    >
                        Browse Products
                    </button>

                </div>
            ) : (
                <div className="grid gap-6 lg:grid-cols-[1fr_360px]">

                    {/* CART ITEMS */}
                    <div className="space-y-4">

                        {cart.map((item) => (
                            <div
                                key={item.id}
                                className="rounded-2xl border border-gray-200 bg-white p-5"
                            >
                                <div className="flex gap-5">

                                    {/* IMAGE */}
                                    <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-xl bg-[#f6f6f7] p-3">

                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="h-full w-full object-contain"
                                            />
                                        ) : (
                                            <Package
                                                size={40}
                                                className="text-gray-300"
                                            />
                                        )}

                                    </div>

                                    {/* INFO */}
                                    <div className="min-w-0 flex-1">

                                        <div className="flex items-start justify-between gap-4">

                                            <div>
                                                <h2 className="line-clamp-2 font-semibold text-gray-900">
                                                    {item.name}
                                                </h2>

                                                <p className="mt-1 text-sm text-gray-500">
                                                    $
                                                    {Number(
                                                        item.price
                                                    ).toFixed(2)}{" "}
                                                    each
                                                </p>
                                            </div>

                                            <button
                                                onClick={() =>
                                                    setDeleteConfirmation({
                                                        isOpen: true,
                                                        item,
                                                    })
                                                }
                                                className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                                                title="Remove item"
                                            >
                                                <Trash2
                                                    size={18}
                                                />
                                            </button>

                                        </div>

                                        <div className="mt-5 flex items-center justify-between">

                                            {/* QUANTITY */}
                                            <div className="flex items-center rounded-xl border border-gray-200">

                                                <button
                                                    onClick={() =>
                                                        decreaseQuantity(
                                                            item.id
                                                        )
                                                    }
                                                    className="p-2.5 text-gray-500 transition hover:text-black"
                                                >
                                                    <Minus
                                                        size={16}
                                                    />
                                                </button>

                                                <span className="w-10 text-center text-sm font-semibold">
                                                    {item.quantity}
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        increaseQuantity(
                                                            item.id
                                                        )
                                                    }
                                                    disabled={
                                                        item.quantity >=
                                                        item.stock
                                                    }
                                                    className="p-2.5 text-gray-500 transition hover:text-black disabled:cursor-not-allowed disabled:opacity-30"
                                                >
                                                    <Plus
                                                        size={16}
                                                    />
                                                </button>

                                            </div>

                                            {/* ITEM TOTAL */}
                                            <p className="text-lg font-bold">
                                                $
                                                {(
                                                    Number(
                                                        item.price
                                                    ) *
                                                    item.quantity
                                                ).toFixed(2)}
                                            </p>

                                        </div>

                                    </div>

                                </div>
                            </div>
                        ))}

                    </div>

                    {/* SUMMARY */}
                    <div className="h-fit rounded-2xl border border-gray-200 bg-white p-6 lg:sticky lg:top-6">

                        <h2 className="text-xl font-bold">
                            Order Summary
                        </h2>

                        <div className="mt-6 space-y-4">

                            <div className="flex justify-between text-sm text-gray-500">
                                <span>
                                    Subtotal
                                </span>

                                <span className="font-medium text-gray-900">
                                    ${subtotal.toFixed(2)}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm text-gray-500">
                                <span>
                                    Shipping
                                </span>

                                <span className="font-medium text-green-600">
                                    Free
                                </span>
                            </div>

                        </div>

                        <div className="my-6 border-t border-gray-200" />

                        <div className="flex items-center justify-between">
                            <span className="font-semibold">
                                Total
                            </span>

                            <span className="text-2xl font-bold">
                                ${total.toFixed(2)}
                            </span>
                        </div>

                        <button
                            onClick={() =>
                                navigate("/checkout")
                            }
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-4 font-semibold text-white transition hover:bg-gray-800"
                        >
                            <CreditCard size={18} />
                            Proceed to Checkout
                        </button>

                        <p className="mt-4 text-center text-xs leading-5 text-gray-400">
                            Your stock will be verified again
                            when you place the order.
                        </p>

                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {deleteConfirmation.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 border border-black/10 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
                                    <Trash2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-[#1d1d1f]">
                                        {deleteConfirmation.item ? "Remove from Cart?" : "Clear Shopping Cart?"}
                                    </h3>
                                    <p className="text-xs text-[#86868b] mt-0.5">
                                        {deleteConfirmation.item
                                            ? "Are you sure you want to remove this item from your cart?"
                                            : "Are you sure you want to remove all items from your cart?"}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setDeleteConfirmation({ isOpen: false, item: null })}
                                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 text-[#86868b] hover:text-[#1d1d1f] flex items-center justify-center transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Item Preview (if single item) */}
                        {deleteConfirmation.item && (
                            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#f5f5f7] border border-black/5">
                                <div className="w-14 h-14 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0 border border-black/5">
                                    {deleteConfirmation.item.imageUrl ? (
                                        <img
                                            src={deleteConfirmation.item.imageUrl}
                                            alt={deleteConfirmation.item.name}
                                            className="h-full w-full object-contain"
                                        />
                                    ) : (
                                        <Package className="w-6 h-6 text-gray-400" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-[#1d1d1f] truncate">
                                        {deleteConfirmation.item.name}
                                    </p>
                                    <p className="text-xs text-[#86868b] mt-0.5">
                                        Qty: {deleteConfirmation.item.quantity} • ${(Number(deleteConfirmation.item.price) * deleteConfirmation.item.quantity).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeleteConfirmation({ isOpen: false, item: null })}
                                className="px-4 py-2.5 rounded-xl border border-black/10 text-sm font-medium text-[#1d1d1f] hover:bg-black/5 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-semibold shadow-md shadow-red-500/20 transition flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>{deleteConfirmation.item ? "Yes, Remove" : "Yes, Clear All"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Cart;