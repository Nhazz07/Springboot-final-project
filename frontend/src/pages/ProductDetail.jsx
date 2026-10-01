import { useEffect, useState } from "react";
import {
    ArrowLeft,
    Minus,
    Plus,
    ShoppingCart,
    Package,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById } from "../services/customerApi";

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadProduct = async () => {
            try {
                setLoading(true);

                const data = await getProductById(id);

                setProduct(data);
            } catch (err) {
                console.error(err);
                setError("Failed to load product.");
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [id]);

    const addToCart = () => {
        if (!product || product.quantity <= 0) {
            return;
        }

        const cart = JSON.parse(
            localStorage.getItem("cart") || "[]"
        );

        const existing = cart.find(
            (item) => item.id === product.id
        );

        if (existing) {
            existing.quantity = Math.min(
                existing.quantity + quantity,
                product.quantity
            );
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: Number(product.price),
                quantity,
                stock: product.quantity,
                imageUrl: product.imageUrl,
            });
        }

        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );

        navigate("/cart");
    };

    if (loading) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">
                <div className="text-sm text-gray-500">
                    Loading product...
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="flex min-h-[500px] flex-col items-center justify-center">
                <Package
                    size={50}
                    className="text-gray-300"
                />

                <p className="mt-4 text-gray-500">
                    {error || "Product not found."}
                </p>

                <button
                    onClick={() => navigate("/")}
                    className="mt-5 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white"
                >
                    Back to Store
                </button>
            </div>
        );
    }

    const stock = product.quantity || 0;
    const outOfStock = stock <= 0;

    return (
        <div className="py-6">

            {/* BACK BUTTON */}
            <button
                onClick={() => navigate("/")}
                className="mb-7 flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-black"
            >
                <ArrowLeft size={18} />
                Back to Store
            </button>

            {/* PRODUCT */}
            <div className="grid overflow-hidden rounded-3xl border border-gray-200 bg-white md:grid-cols-2">

                {/* IMAGE */}
                <div className="flex min-h-[450px] items-center justify-center bg-[#f6f6f7] p-10">

                    {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="max-h-[420px] w-full object-contain"
                        />
                    ) : (
                        <Package
                            size={100}
                            className="text-gray-300"
                        />
                    )}

                </div>

                {/* DETAILS */}
                <div className="flex flex-col justify-center p-8 md:p-12">

                    <p className="text-sm font-medium uppercase tracking-wider text-gray-400">
                        {product.categoryName || "Product"}
                    </p>

                    <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900">
                        {product.name}
                    </h1>

                    <p className="mt-5 text-3xl font-bold">
                        ${Number(product.price).toFixed(2)}
                    </p>

                    {/* DESCRIPTION */}
                    <p className="mt-6 leading-7 text-gray-500">
                        {product.description ||
                            "A quality product available from our store."}
                    </p>

                    {/* STOCK */}
                    <div className="mt-6">
                        {outOfStock ? (
                            <span className="rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
                                Out of stock
                            </span>
                        ) : (
                            <span className="rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-600">
                                {stock} items available
                            </span>
                        )}
                    </div>

                    {!outOfStock && (
                        <>
                            {/* QUANTITY */}
                            <div className="mt-8">

                                <p className="mb-3 text-sm font-semibold">
                                    Quantity
                                </p>

                                <div className="flex w-fit items-center rounded-xl border border-gray-200">

                                    <button
                                        onClick={() =>
                                            setQuantity(
                                                Math.max(
                                                    1,
                                                    quantity - 1
                                                )
                                            )
                                        }
                                        className="p-3 text-gray-500 transition hover:text-black"
                                    >
                                        <Minus size={18} />
                                    </button>

                                    <span className="w-12 text-center font-semibold">
                                        {quantity}
                                    </span>

                                    <button
                                        onClick={() =>
                                            setQuantity(
                                                Math.min(
                                                    stock,
                                                    quantity + 1
                                                )
                                            )
                                        }
                                        disabled={
                                            quantity >= stock
                                        }
                                        className="p-3 text-gray-500 transition hover:text-black disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                        <Plus size={18} />
                                    </button>

                                </div>

                            </div>

                            {/* ADD TO CART */}
                            <button
                                onClick={addToCart}
                                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-4 font-semibold text-white transition hover:bg-gray-800"
                            >
                                <ShoppingCart size={19} />
                                Add to Cart
                            </button>

                            {/* BUY NOW */}
                            <button
                                onClick={() => {
                                    addToCart();
                                }}
                                className="mt-3 w-full rounded-xl border border-gray-200 px-5 py-4 font-semibold transition hover:bg-gray-50"
                            >
                                Buy Now
                            </button>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
}

export default ProductDetail;