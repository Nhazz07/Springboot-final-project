import { useState, useEffect } from "react";
import { getProducts } from "../services/productApi.js";
import ProductCard from "../components/ProductCard";

function POS() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Header */}
            <header className="border-b bg-white">
                <div className="mx-auto max-w-7xl px-6 py-5">

                    <h1 className="text-2xl font-bold text-gray-900">
                        Point of Sale
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        View available products and stock.
                    </p>

                </div>
            </header>

            {/* Products */}
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
                                showCartButton={false}
                            />
                        ))}

                    </div>
                )}

            </main>

        </div>
    );
}

export default POS;