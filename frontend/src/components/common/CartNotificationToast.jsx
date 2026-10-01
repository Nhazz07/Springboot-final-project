import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ShoppingCart, X, Package } from 'lucide-react';

const CartNotificationToast = ({ product, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!product) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [product, onClose]);

  if (!product) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white/95 backdrop-blur-xl border border-black/10 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-start gap-3.5">
        {/* Product Thumbnail / Icon */}
        <div className="relative w-14 h-14 rounded-xl bg-[#f5f5f7] border border-black/5 overflow-hidden shrink-0 flex items-center justify-center">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-contain p-1"
            />
          ) : (
            <Package className="w-6 h-6 text-[#86868b]" />
          )}
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#34c759] border-2 border-white flex items-center justify-center text-white">
            <Check className="w-3 h-3 stroke-[2.5px]" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#34c759]">
              Added to Cart
            </p>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/5 transition"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <h4 className="text-sm font-bold text-[#1d1d1f] truncate mt-0.5">
            {product.name}
          </h4>
          <p className="text-xs text-[#86868b] mt-0.5">
            ${Number(product.price).toFixed(2)} • Quantity: {product.addedQuantity || 1}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                navigate('/cart');
              }}
              className="flex-1 py-1.5 px-3 rounded-xl bg-[#1d1d1f] hover:bg-[#333336] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs active:scale-95"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>View Cart</span>
            </button>
            <button
              onClick={onClose}
              className="py-1.5 px-3 rounded-xl bg-[#f5f5f7] hover:bg-[#ebebee] text-[#1d1d1f] text-xs font-medium border border-black/5 transition active:scale-95"
            >
              Keep Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartNotificationToast;
