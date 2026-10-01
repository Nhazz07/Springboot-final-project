import {
    CheckCircle,
    X,
    Package,
} from "lucide-react";

function OrderConfirmation({
                               order,
                               onClose,
                           }) {
    if (!order) {
        return null;
    }

    const createdDate = order.createdAt
        ? new Date(order.createdAt).toLocaleString()
        : new Date().toLocaleString();

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

                {/* Header */}

                <div className="relative border-b px-6 py-6 text-center">

                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    >
                        <X size={20} />
                    </button>

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle
                            size={36}
                            className="text-green-600"
                        />
                    </div>

                    <h2 className="mt-4 text-2xl font-bold text-gray-900">
                        Order Confirmed
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Your order has been created successfully.
                    </p>

                </div>

                {/* Order Information */}

                <div className="border-b px-6 py-5">

                    <div className="grid grid-cols-2 gap-4">

                        <div>
                            <p className="text-xs font-medium uppercase text-gray-400">
                                Order Number
                            </p>

                            <p className="mt-1 font-semibold text-gray-900">
                                {order.orderNumber}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase text-gray-400">
                                Date
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-700">
                                {createdDate}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase text-gray-400">
                                Customer
                            </p>

                            <p className="mt-1 font-medium text-gray-700">
                                {order.username || "Current User"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase text-gray-400">
                                Status
                            </p>

                            <span className="mt-1 inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                                {order.status || "PENDING"}
                            </span>
                        </div>

                    </div>

                </div>

                {/* Products */}

                <div className="max-h-64 overflow-y-auto px-6 py-5">

                    <h3 className="mb-4 font-semibold text-gray-900">
                        Order Items
                    </h3>

                    <div className="space-y-3">

                        {order.items?.map((item) => (
                            <div
                                key={item.id || item.productId}
                                className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3"
                            >

                                <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                                        <Package
                                            size={20}
                                            className="text-gray-500"
                                        />
                                    </div>

                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {item.productName}
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            ${Number(item.unitPrice).toFixed(2)}
                                            {" × "}
                                            {item.quantity}
                                        </p>
                                    </div>

                                </div>

                                <p className="font-semibold text-gray-900">
                                    ${Number(item.subtotal).toFixed(2)}
                                </p>

                            </div>
                        ))}

                    </div>

                </div>

                {/* Total */}

                <div className="border-t bg-gray-50 px-6 py-5">

                    <div className="flex items-center justify-between">

                        <span className="text-gray-500">
                            Total
                        </span>

                        <span className="text-2xl font-bold text-gray-900">
                            ${Number(order.totalAmount).toFixed(2)}
                        </span>

                    </div>

                    <button
                        onClick={onClose}
                        className="mt-5 w-full rounded-xl bg-black px-4 py-3 font-semibold text-white transition hover:bg-gray-800"
                    >
                        Done
                    </button>

                </div>

            </div>

        </div>
    );
}

export default OrderConfirmation;