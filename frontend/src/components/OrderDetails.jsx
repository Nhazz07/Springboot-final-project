import {
    X,
    Package,
    AlertTriangle,
} from "lucide-react";

function OrderDetails({
                          order,
                          onClose,
                          onCancel,
                          cancelling,
                      }) {
    if (!order) {
        return null;
    }

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        return new Date(date).toLocaleString();
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "PENDING":
                return "bg-yellow-100 text-yellow-700";

            case "PROCESSING":
                return "bg-blue-100 text-blue-700";

            case "COMPLETED":
                return "bg-green-100 text-green-700";

            case "CANCELLED":
                return "bg-red-100 text-red-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const canCancel = order.status === "PENDING";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

                {/* Header */}

                <div className="flex items-center justify-between border-b px-6 py-5">

                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Order Details
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-gray-900">
                            {order.orderNumber}
                        </h2>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    >
                        <X size={20} />
                    </button>

                </div>

                {/* Order Information */}

                <div className="grid grid-cols-2 gap-4 border-b px-6 py-5 md:grid-cols-4">

                    <div>
                        <p className="text-xs uppercase text-gray-400">
                            Customer
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-900">
                            {order.username || "N/A"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs uppercase text-gray-400">
                            Status
                        </p>

                        <span
                            className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                                order.status
                            )}`}
                        >
                            {order.status}
                        </span>
                    </div>

                    <div>
                        <p className="text-xs uppercase text-gray-400">
                            Created
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-700">
                            {formatDate(order.createdAt)}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs uppercase text-gray-400">
                            User ID
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-700">
                            #{order.userId}
                        </p>
                    </div>

                </div>

                {/* Items */}

                <div className="flex-1 overflow-y-auto px-6 py-5">

                    <h3 className="mb-4 font-semibold text-gray-900">
                        Order Items
                    </h3>

                    <div className="space-y-3">

                        {order.items?.map((item) => (
                            <div
                                key={item.id || item.productId}
                                className="flex items-center justify-between rounded-xl border border-gray-200 p-4"
                            >

                                <div className="flex items-center gap-3">

                                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100">
                                        <Package
                                            size={21}
                                            className="text-gray-500"
                                        />
                                    </div>

                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {item.productName}
                                        </p>

                                        <p className="mt-1 text-sm text-gray-500">
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

                {/* Footer */}

                <div className="border-t bg-gray-50 px-6 py-5">

                    <div className="flex items-center justify-between">

                        <span className="text-gray-500">
                            Total
                        </span>

                        <span className="text-2xl font-bold text-gray-900">
                            ${Number(order.totalAmount).toFixed(2)}
                        </span>

                    </div>

                    {/* Cancel Warning */}

                    {canCancel && (
                        <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

                            <AlertTriangle
                                size={19}
                                className="mt-0.5 shrink-0 text-red-500"
                            />

                            <div>
                                <p className="text-sm font-semibold text-red-700">
                                    Cancel this order?
                                </p>

                                <p className="mt-1 text-xs text-red-600">
                                    Cancelling this order will return the
                                    purchased products to inventory.
                                </p>
                            </div>

                        </div>
                    )}

                    <div className="mt-4 flex gap-3">

                        <button
                            onClick={onClose}
                            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
                        >
                            Close
                        </button>

                        {canCancel && (
                            <button
                                onClick={onCancel}
                                disabled={cancelling}
                                className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {cancelling
                                    ? "Cancelling..."
                                    : "Cancel Order"}
                            </button>
                        )}

                    </div>

                </div>

            </div>

        </div>
    );
}

export default OrderDetails;