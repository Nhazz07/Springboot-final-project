import {
    Minus,
    Plus,
    Trash2,
    ShoppingCart,
    X,
} from "lucide-react";

function CartDrawer({
                        cart,
                        onClose,
                        onIncrease,
                        onDecrease,
                        onRemove,
                        onCreateOrder,
                    }) {
    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30">

            {/* Drawer */}
            <div className="flex h-full w-full max-w-md flex-col bg-white shadow-xl">

                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-5">

                    <div className="flex items-center gap-2">
                        <ShoppingCart size={22} />

                        <h2 className="text-xl font-bold">
                            Cart
                        </h2>

                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
              {cart.length}
            </span>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>

                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-6">

                    {cart.length === 0 ? (

                        <div className="flex h-full flex-col items-center justify-center text-center">

                            <ShoppingCart
                                size={48}
                                className="mb-4 text-gray-300"
                            />

                            <h3 className="text-lg font-semibold text-gray-700">
                                Your cart is empty
                            </h3>

                            <p className="mt-1 text-sm text-gray-400">
                                Add products to create an order.
                            </p>

                        </div>

                    ) : (

                        <div className="space-y-4">

                            {cart.map((item) => (

                                <div
                                    key={item.id}
                                    className="rounded-xl border border-gray-200 p-4"
                                >

                                    {/* Product info */}
                                    <div className="flex justify-between">

                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {item.name}
                                            </h3>

                                            <p className="text-sm text-gray-500">
                                                ${item.price.toFixed(2)}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => onRemove(item.id)}
                                            className="text-gray-400 hover:text-red-500"
                                        >
                                            <Trash2 size={18} />
                                        </button>

                                    </div>

                                    {/* Quantity */}
                                    <div className="mt-4 flex items-center justify-between">

                                        <div className="flex items-center gap-3">

                                            <button
                                                onClick={() => onDecrease(item.id)}
                                                className="rounded-lg border p-1.5 hover:bg-gray-100"
                                            >
                                                <Minus size={16} />
                                            </button>

                                            <span className="w-6 text-center font-semibold">
                        {item.quantity}
                      </span>

                                            <button
                                                onClick={() => onIncrease(item.id)}
                                                disabled={item.quantity >= item.stock}
                                                className="rounded-lg border p-1.5 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                <Plus size={16} />
                                            </button>

                                        </div>

                                        <span className="font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>

                                    </div>

                                    <p className="mt-2 text-xs text-gray-400">
                                        Available stock: {item.stock}
                                    </p>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

                {/* Footer */}
                <div className="border-t p-6">

                    <div className="mb-4 flex items-center justify-between">

            <span className="text-gray-500">
              Total
            </span>

                        <span className="text-2xl font-bold">
              ${total.toFixed(2)}
            </span>

                    </div>

                    <button
                        onClick={onCreateOrder}
                        disabled={cart.length === 0}
                        className="w-full rounded-xl bg-black px-4 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                        Create Order
                    </button>

                </div>

            </div>
        </div>
    );
}

export default CartDrawer;