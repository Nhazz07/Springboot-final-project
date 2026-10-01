import { ShoppingCart } from "lucide-react";

function ProductCard({
                         product,
                         onAddToCart,
                         showCartButton = true,
                     }) {
    const isOutOfStock = product.stock === 0;

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

            {/* Product Image */}
            <div className="mb-4 flex h-40 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-contain"
                    />
                ) : (
                    <span className="text-5xl text-gray-400">
                        No Image
                    </span>
                )}
            </div>

            {/* Product Information */}
            <h3 className="text-lg font-semibold text-gray-900">
                {product.name}
            </h3>

            <p className="mt-1 text-sm text-gray-500">
                {product.category}
            </p>

            {/* Price + Stock */}
            <div className="mt-3 flex items-center justify-between">

                {/* Price */}
                <span className="text-xl font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                </span>

                {/* Stock */}
                <span
                    className={`text-sm font-medium ${
                        isOutOfStock
                            ? "text-red-500"
                            : product.stock <= 5
                                ? "text-orange-500"
                                : "text-green-600"
                    }`}
                >
                    {isOutOfStock
                        ? "Out of stock"
                        : `${product.stock} in stock`}
                </span>

            </div>

            {/* Add to Cart Button */}
            {showCartButton && (
                <button
                    onClick={() => onAddToCart(product)}
                    disabled={isOutOfStock}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                    <ShoppingCart size={18} />

                    {isOutOfStock
                        ? "Out of Stock"
                        : "Add to Cart"}
                </button>
            )}

        </div>
    );
}

export default ProductCard;