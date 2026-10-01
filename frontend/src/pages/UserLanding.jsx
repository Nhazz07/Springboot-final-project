import { useEffect, useMemo, useState } from "react";
import {
    Search,
    ShoppingCart,
    ArrowRight,
    Package,
    Sparkles,
    Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CartNotificationToast from "../components/common/CartNotificationToast";
import { getProducts } from "../services/productApi";

function UserLanding() {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [toastProduct, setToastProduct] = useState(null);

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
        const loadProducts = async () => {
            try {
                setLoading(true);

                const data = await getProducts();

                setProducts(data || []);
            } catch (err) {
                console.error(err);
                setError("Unable to load products.");
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);

    const categories = useMemo(() => {
        const values = products
            .map((product) => product.categoryName)
            .filter(Boolean);

        return ["All", ...new Set(values)];
    }, [products]);

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

    return (
        <div className="pb-16">

            {/* HERO */}
            <section className="relative overflow-hidden rounded-3xl bg-[#111111] px-8 py-14 text-white md:px-12 md:py-20">

                <div className="relative z-10 max-w-2xl">

                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-gray-300">
                        <Sparkles size={15} />
                        Welcome to our store
                    </div>

                    <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
                        Everything you need,
                        <span className="block text-gray-400">
                            all in one place.
                        </span>
                    </h1>

                    <p className="mt-5 max-w-xl text-base leading-7 text-gray-400 md:text-lg">
                        Discover quality products, add them to
                        your cart, and checkout easily.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        <button
                            onClick={() =>
                                document
                                    .getElementById("products")
                                    ?.scrollIntoView({
                                        behavior: "smooth",
                                    })
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-black transition hover:bg-gray-200 active:scale-95 shadow-sm"
                        >
                            Shop Now
                            <ArrowRight size={18} />
                        </button>

                        <button
                            onClick={() => navigate("/purchase-history")}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 font-semibold text-white backdrop-blur-md transition hover:bg-white/20 active:scale-95"
                        >
                            <Clock size={17} />
                            Purchase History
                        </button>
                    </div>
                </div>

                {/* Decorative circles */}
                <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/10" />
                <div className="absolute -bottom-32 -right-10 h-80 w-80 rounded-full border border-white/10" />

            </section>

            {/* SEARCH */}
            <section
                id="products"
                className="mt-10"
            >
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Browse Products
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Find something you like.
                        </p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search products..."
                            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-black"
                        />
                    </div>
                </div>

                {/* CATEGORY FILTER */}
                <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
                    {categories.map((item) => (
                        <button
                            key={item}
                            onClick={() =>
                                setCategory(item)
                            }
                            className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition ${
                                category === item
                                    ? "bg-black text-white"
                                    : "border border-gray-200 bg-white text-gray-600 hover:border-gray-400"
                            }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </section>

            {/* PRODUCTS */}
            <section className="mt-8">

                {loading && (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="h-96 animate-pulse rounded-2xl bg-gray-100"
                            />
                        ))}
                    </div>
                )}

                {error && !loading && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center text-red-600">
                        {error}
                    </div>
                )}

                {!loading &&
                    !error &&
                    filteredProducts.length === 0 && (
                        <div className="rounded-2xl border border-gray-200 bg-white py-20 text-center">
                            <Package
                                size={45}
                                className="mx-auto text-gray-300"
                            />

                            <h3 className="mt-4 text-lg font-semibold">
                                No products found
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Try another search or category.
                            </p>
                        </div>
                    )}

                {!loading &&
                    !error &&
                    filteredProducts.length > 0 && (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                            {filteredProducts.map(
                                (product) => {
                                    const totalStock = product.quantity || 0;
                                    const cartItem = cart.find((item) => item.id === product.id);
                                    const inCartQty = cartItem ? cartItem.quantity : 0;
                                    const availableStock = Math.max(0, totalStock - inCartQty);
                                    const outOfStock = availableStock <= 0;

                                    return (
                                        <div
                                            key={product.id}
                                            className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                                        >
                                            {/* IMAGE */}
                                            <div
                                                onClick={() => navigate(`/products/${product.id}`)}
                                                className="relative flex h-56 items-center justify-center bg-[#f6f6f7] p-6 cursor-pointer"
                                            >
                                                {product.imageUrl ? (
                                                    <img
                                                        src={
                                                            product.imageUrl
                                                        }
                                                        alt={
                                                            product.name
                                                        }
                                                        className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <Package
                                                        size={60}
                                                        className="text-gray-300"
                                                    />
                                                )}

                                                {outOfStock && (
                                                    <div className="absolute left-4 top-4 rounded-full bg-black/85 backdrop-blur-xs px-3 py-1 text-xs font-semibold text-white">
                                                        {totalStock <= 0 ? "Out of stock" : "Cart limit"}
                                                    </div>
                                                )}
                                            </div>

                                            {/* INFO */}
                                            <div className="p-5">
                                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                                    {product.categoryName ||
                                                        "Product"}
                                                </p>

                                                <h3
                                                    onClick={() => navigate(`/products/${product.id}`)}
                                                    className="mt-1 line-clamp-1 text-lg font-semibold cursor-pointer hover:text-black transition"
                                                >
                                                    {product.name}
                                                </h3>

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
                                                            ? totalStock <= 0
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
                                                        className="flex-1 rounded-xl border border-gray-200 px-3 py-3 text-sm font-medium transition hover:bg-gray-50"
                                                    >
                                                        View Details
                                                    </button>

                                                    <button
                                                        disabled={outOfStock}
                                                        onClick={() => addToCart(product)}
                                                        title={outOfStock ? "Out of stock / cart limit reached" : "Add to Cart"}
                                                        className="flex items-center justify-center rounded-xl bg-black px-4 py-3 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200"
                                                    >
                                                        <ShoppingCart size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                            )}

                        </div>
                    )}

            </section>

            {/* Added to Cart Notification Toast */}
            <CartNotificationToast
                product={toastProduct}
                onClose={() => setToastProduct(null)}
            />

        </div>
    );
}

export default UserLanding;