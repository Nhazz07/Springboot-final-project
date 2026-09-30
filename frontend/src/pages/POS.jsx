import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";

import { getProducts } from "../api/productApi.js";

import ProductCard from "../components/ProductCard";
import CartDrawer from "../components/CartDrawer";

function POS() {
    // Product State

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Cart State

    const [cart, setCart] = useState([]);
    const [cartOpen, setCartOpen] = useState(false);

    // Load Products

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await getProducts();

                const formattedProducts = data.map((product) => ({
                    id: product.id,
                    name: product.name,
                    category: product.categoryName,
                    price: Number(product.price),
                    stock: product.quantity,
                    imageUrl: product.imageUrl,
                }));

                setProducts(formattedProducts);
            } catch (error) {
                console.error("Failed to load products:", error);
                setError("Failed to load products.");
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);

    // Add Product To Cart

    const addToCart = (product) => {
        setCart((currentCart) => {
            const existingItem = currentCart.find(
                (item) => item.id === product.id
            );

            // Product already exists
            if (existingItem) {
                // Don't exceed available stock
                if (existingItem.quantity >= product.stock) {
                    return currentCart;
                }

                return currentCart.map((item) =>
                    item.id === product.id
                        ? {
                            ...item,
                            quantity: item.quantity + 1,
                        }
                        : item
                );
            }

            // Product doesn't exist in cart
            return [
                ...currentCart,
                {
                    ...product,
                    quantity: 1,
                },
            ];
        });
    };

    // Increase Quantity

    const increaseQuantity = (id) => {
        setCart((currentCart) =>
            currentCart.map((item) => {
                if (item.id !== id) {
                    return item;
                }

                // Don't exceed stock
                if (item.quantity >= item.stock) {
                    return item;
                }

                return {
                    ...item,
                    quantity: item.quantity + 1,
                };
            })
        );
    };

    // Decrease Quantity

    const decreaseQuantity = (id) => {
        setCart((currentCart) =>
            currentCart
                .map((item) =>
                    item.id === id
                        ? {
                            ...item,
                            quantity: item.quantity - 1,
                        }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    };
    // Remove Product

    const removeFromCart = (id) => {
        setCart((currentCart) =>
            currentCart.filter((item) => item.id !== id)
        );
    };


    // Create Order


    const createOrder = () => {
        console.log("Order:", cart);

        alert("Order created successfully!");

        setCart([]);
        setCartOpen(false);
    };

    // Cart Item Count

    const cartItemCount = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    // UI

    return (
        <div className="min-h-screen bg-gray-50">

            {/*header*/}

            <header className="border-b bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

                    {/* Title */}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Point of Sale
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Select products to create an order.
                        </p>
                    </div>

                    {/* Cart Button */}
                    <button
                        onClick={() => setCartOpen(true)}
                        className="relative flex items-center gap-2 rounded-xl bg-black px-5 py-3 font-medium text-white hover:bg-gray-800"
                    >
                        <ShoppingCart size={19} />

                        Cart

                        {cartItemCount > 0 && (
                            <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                {cartItemCount}
                            </span>
                        )}
                    </button>

                </div>
            </header>

            {/*product*/}

            <main className="mx-auto max-w-7xl px-6 py-8">

                {/* Loading */}
                {loading && (
                    <div className="py-20 text-center text-gray-500">
                        Loading products...
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="rounded-xl bg-red-50 p-4 text-center text-red-600">
                        {error}
                    </div>
                )}

                {/* Product Grid */}
                {!loading && !error && (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={addToCart}
                            />
                        ))}

                    </div>
                )}

            </main>

            {/*Cart drawer*/}

            {cartOpen && (
                <CartDrawer
                    cart={cart}
                    onClose={() => setCartOpen(false)}
                    onIncrease={increaseQuantity}
                    onDecrease={decreaseQuantity}
                    onRemove={removeFromCart}
                    onCreateOrder={createOrder}
                />
            )}

        </div>
    );
}

export default POS;