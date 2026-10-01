import { useEffect, useMemo, useState } from "react";
import {
    Search,
    ShoppingCart,
    Eye,
    Package,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CartNotificationToast from "../components/common/CartNotificationToast";

import { getProducts } from "../services/customerApi";

function Catalog() {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [toastProduct, setToastProduct] = useState(null);

    // Real-time cart state for dynamic live stock deduction
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

    // ==========================================
    // LOAD PRODUCTS
    // ==========================================

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);

                const data = await getProducts();

                setProducts(data || []);
            } catch (err) {
                console.error(err);

                setError(
                    err.response?.data?.message ||
                    "Failed to load products."
                );
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);

    // ==========================================
    // CATEGORIES
    // ==========================================

    const categories = useMemo(() => {
        const values = products
            .map((product) => product.categoryName)
            .filter(Boolean);

        return ["All", ...new Set(values)];
    }, [products]);

    // ==========================================
    // FILTER PRODUCTS
    // ==========================================

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesSearch =
                product.name
                    ?.toLowerCase()
                    .includes(search.toLowerCase());

            const matchesCategory =
                category === "All" ||
                product.categoryName === category;

            return matchesSearch && matchesCategory;
        });
    }, [products, search, category]);

    // ==========================================
    // ADD TO CART (REAL-TIME STOCK DEDUCT & LIMIT)
    // ==========================================

    const addToCart = (product) => {
        const currentCart = JSON.parse(
            localStorage.getItem("cart") || "[]"
        );

        const existing = currentCart.find(
            (item) => item.id === product.id
        );

        const inCartQty = existing ? existing.quantity : 0;
        const totalStock = product.quantity || 0;

        // Stop when out of stock / max available reached
        if (inCartQty >= totalStock || totalStock <= 0) {
            return;
        }

        if (existing) {
            existing.quantity += 1;
        } else {
            currentCart.push({
                id: product.id,
                name: product.name,
                price: Number(product.price),
                quantity: 1,
                stock: totalStock,
                imageUrl: product.imageUrl,
            });
        }

        localStorage.setItem(
            "cart",
            JSON.stringify(currentCart)
        );
        // Instantly update local state so visible stock decrements on screen
        setCart(currentCart);

        window.dispatchEvent(new Event("cart-updated"));
        setToastProduct({ ...product, addedQuantity: 1 });
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="py-20 text-center">
                <p className="text-gray-500">
                    Loading products...
                </p>
            </div>
        );
    }

    // ==========================================
    // ERROR
    // ==========================================

    if (error) {
        return (
            <div className="py-20 text-center">
                <p className="text-red-500">
                    {error}
                </p>
            </div>
        );
    }

    // ==========================================
    // PAGE
    // ==========================================

    return (
        <div className="py-6">

            {/* HEADER */}

            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

                <div>
                    <p className="text-sm font-medium text-gray-400">
                        STORE
                    </p>

                    <h1 className="mt-1 text-3xl font-bold">
                        Product Catalog
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Browse products and find something you like.
                    </p>
                </div>

                <button
                    onClick={() => navigate("/cart")}
                    className="flex w-fit items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
                >
                    <ShoppingCart size={18} />
                    Cart
                </button>

            </div>

            {/* SEARCH */}

            <div className="mt-8 flex flex-col gap-4 md:flex-row">

                <div className="relative flex-1">

                    <Search
                        size={19}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        placeholder="Search products..."
                        className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-black"
                    />

                </div>

            </div>

            {/* CATEGORIES */}

            <div className="mt-5 flex gap-2 overflow-x-auto pb-2">

                {categories.map((item) => (

                    <button
                        key={item}
                        onClick={() =>
                            setCategory(item)
                        }
                        className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition ${
                            category === item
                                ? "bg-black text-white"
                                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                        {item}
                    </button>

                ))}

            </div>

            {/* PRODUCT COUNT */}

            <div className="mt-8">

                <p className="text-sm text-gray-500">
                    {filteredProducts.length}{" "}
                    {filteredProducts.length === 1
                        ? "product"
                        : "products"}
                </p>

            </div>

            {/* PRODUCTS */}

            {filteredProducts.length === 0 ? (

                <div className="mt-6 rounded-2xl border border-gray-200 bg-white py-20 text-center">

                    <Package
                        size={50}
                        className="mx-auto text-gray-300"
                    />

                    <h2 className="mt-5 text-xl font-bold">
                        No products found
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        Try another search or category.
                    </p>

                </div>

            ) : (

                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                    {filteredProducts.map((product) => {
                        const cartItem = cart.find((item) => item.id === product.id);
                        const inCartQty = cartItem ? cartItem.quantity : 0;
                        const availableStock = Math.max(0, (product.quantity || 0) - inCartQty);
                        const outOfStock = availableStock <= 0;

                        return (
                            <div
                                key={product.id}
                                className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-md"
                            >
                                {/* IMAGE */}
                                <div
                                    onClick={() => navigate(`/products/${product.id}`)}
                                    className="flex h-56 items-center justify-center bg-gray-50 p-5 cursor-pointer group"
                                >
                                    {product.imageUrl ? (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <Package
                                            size={55}
                                            className="text-gray-300"
                                        />
                                    )}
                                </div>

                                {/* INFO */}
                                <div className="p-5">
                                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                                        {product.categoryName ||
                                            "Product"}
                                    </p>

                                    <h2
                                        onClick={() => navigate(`/products/${product.id}`)}
                                        className="mt-1 truncate text-lg font-bold cursor-pointer hover:text-black transition"
                                    >
                                        {product.name}
                                    </h2>

                                    <div className="mt-3 flex items-center justify-between">
                                        <span className="text-xl font-bold">
                                            $
                                            {Number(
                                                product.price
                                            ).toFixed(2)}
                                        </span>

                                        <span
                                            className={`text-xs font-semibold ${
                                                outOfStock
                                                    ? "text-red-500"
                                                    : "text-green-600"
                                            }`}
                                        >
                                            {outOfStock
                                                ? (product.quantity || 0) <= 0
                                                    ? "Out of stock"
                                                    : "Cart limit reached"
                                                : `${availableStock} in stock`}
                                        </span>
                                    </div>

                                    {/* ACTIONS */}
                                    <div className="mt-5 flex gap-2">
                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/products/${product.id}`
                                                )
                                            }
                                            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-medium hover:bg-gray-50"
                                        >
                                            <Eye size={17} />
                                            Details
                                        </button>

                                        <button
                                            onClick={() =>
                                                addToCart(product)
                                            }
                                            disabled={
                                                outOfStock
                                            }
                                            className="flex items-center justify-center rounded-xl bg-black px-4 py-3 text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                                            title={outOfStock ? "Out of stock / cart limit reached" : "Add to Cart"}
                                        >
                                            <ShoppingCart
                                                size={18}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                </div>

            )}

            {/* Added to Cart Notification Toast */}
            <CartNotificationToast
                product={toastProduct}
                onClose={() => setToastProduct(null)}
            />

        </div>
    );
}

export default Catalog;