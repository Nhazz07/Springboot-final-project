import ProductCard from "../components/ProductCard.jsx";

const products = [
    {
        id: 1,
        name: "Mechanical Keyboard",
        category: "Accessories",
        price: 59.99,
        stock: 12,
    },
    {
        id: 2,
        name: "Wireless Mouse",
        category: "Accessories",
        price: 29.99,
        stock: 8,
    },
    {
        id: 3,
        name: "Gaming Headset",
        category: "Audio",
        price: 79.99,
        stock: 5,
    },
    {
        id: 4,
        name: "Monitor",
        category: "Display",
        price: 199.99,
        stock: 0,
    },
];

function POS() {
    const handleAddToCart = (product) => {
        console.log("Added to cart:", product);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-7xl">

                <h1 className="mb-2 text-3xl font-bold text-gray-900">
                    Point of Sale
                </h1>

                <p className="mb-8 text-gray-500">
                    Select products to create an order.
                </p>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onAddToCart={handleAddToCart}
                        />
                    ))}
                </div>

            </div>
        </div>
    );
}

export default POS;