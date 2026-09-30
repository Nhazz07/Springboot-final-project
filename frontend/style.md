#  IMS Design System & UI Style Guide

> **For Team Handoff (Mongkol & Nhazz)**  
> This style guide establishes the official visual design language, color tokens, shadow depths, and UI component blueprints for the **Inventory & POS System**. Follow these patterns to ensure complete aesthetic consistency across all modules.

---

## 1. Design Philosophy

- **Inspiration**: Official Apple Web Aesthetics ([apple.com](https://www.apple.com/)).
- **Tone**: Clean, premium, hardware-inspired, and uncluttered.
- **Canvas Backdrop**: Athens Gray (`#f5f5f7`) instead of plain white or stark dark mode.
- **Card Surfaces**: Pure white (`#ffffff`) elevated with subtle borders (`rgba(0, 0, 0, 0.08)`) and gentle multi-layered depth shadows.
- **Motion**: Subtle 200ms–300ms micro-animations with `cubic-bezier(0.16, 1, 0.3, 1)`.

---

## 2. Core Color Palette & Design Tokens

### Primary Interactive Colors

| Token Name | Hex Code | Tailwind / CSS Utility | Usage |
| :--- | :--- | :--- | :--- |
| **Apple Primary** | `#1D1D1F` | `bg-[#1d1d1f] text-white` | Primary CTA buttons, active sidebar tabs, headers |
| **Apple Primary Hover** | `#333336` | `hover:bg-[#333336]` | Hover state for primary buttons |
| **Apple Primary Active** | `#000000` | `active:bg-black` | Mouse-down / click depression |
| **Canvas Background** | `#F5F5F7` | `bg-[#f5f5f7]` | Main application page canvas |
| **Surface Card** | `#FFFFFF` | `bg-white` | Floating cards, panels, table containers |
| **Border Normal** | `rgba(0,0,0,0.08)` | `border border-black/8` | Card dividers, input borders |
| **Border Hover** | `rgba(0,0,0,0.16)` | `hover:border-black/16` | Card hover border highlight |
| **Text Primary** | `#1D1D1F` | `text-[#1d1d1f]` | Headings, titles, prices, main labels |
| **Text Secondary** | `#86868B` | `text-[#86868b]` | Subtitles, SKU numbers, timestamps |

---

### Status Badges & Accents

| Status | Color | Badge Classes |
| :--- | :--- | :--- |
| **In Stock / Success** | `#30D158` (Apple Green) | `bg-[#30d158]/12 text-[#1da441] border border-[#30d158]/25` |
| **Low Stock / Warning** | `#FF9500` (Apple Orange) | `bg-[#ff9500]/12 text-[#b25000] border border-[#ff9500]/25` |
| **Out of Stock / Danger** | `#FF3B30` (Apple Red) | `bg-[#ff3b30]/12 text-[#d70015] border border-[#ff3b30]/25` |

---

## 3. Shadow & Elevation Hierarchy

To achieve the signature Apple depth without harsh drop-shadows, use the following standards:

```css
/* Card Resting Elevation */
.apple-card {
  box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.07), 0 2px 6px -1px rgba(0, 0, 0, 0.04);
}

/* Card Hover Elevation */
.apple-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 32px -4px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.06);
}

/* Primary Button Elevation */
.apple-btn-primary {
  box-shadow: 0 4px 14px 0 rgba(0, 0, 0, 0.18);
}
.apple-btn-primary:hover {
  box-shadow: 0 6px 20px 0 rgba(0, 0, 0, 0.26);
}

/* Dialog / Modal / Drawer Elevation */
.apple-modal {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
}
```

### Tailwind Shortcut Classes

- **Resting Card**: `shadow-sm`
- **Hovered Card**: `hover:shadow-md hover:-translate-y-0.5 transition duration-300`
- **Primary CTA Button**: `shadow-md shadow-black/15 hover:shadow-lg shadow-black/26 active:scale-95 transition`
- **Modals & Drawers**: `shadow-[0_20px_60px_rgba(0,0,0,0.18)]`

---

## 4. Product Image Display Guidelines

> [!IMPORTANT]
> **Always use `object-contain` for product showcase cards.**  
> Using `object-cover` crops outer edges of merchandise (such as laptops, boxes, shoes, and drinks). `object-contain` ensures the entire product is framed cleanly with breathing room.

### Correct Pattern for Product Cards

```jsx
<div className="relative h-48 w-full bg-[#f5f5f7] overflow-hidden flex items-center justify-center p-3">
  {product.imageUrl ? (
    <img
      src={product.imageUrl}
      alt={product.name}
      className="w-full h-full object-contain group-hover:scale-105 transition duration-500"
    />
  ) : (
    <div className="flex flex-col items-center justify-center text-[#86868b] gap-1">
      <Package className="w-8 h-8 stroke-1" />
      <span className="text-[11px] font-medium">No Image</span>
    </div>
  )}
</div>
```

---

## 5. UI Component Blueprints for Nhazz

Use these pre-tested JSX blueprints for the customer-facing storefront, product details, shopping cart, and payment flow:

### A. Customer Shopping Product Card (`ProductCard.jsx`)

```jsx
import React from 'react';
import { ShoppingCart, Package } from 'lucide-react';

const ProductCard = ({ product, onAddToCart, onOpenDetail }) => {
  const isOutOfStock = (product.quantity || product.stock || 0) === 0;

  return (
    <div className="bg-white border border-black/8 rounded-2xl overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-md hover:-translate-y-0.5 transition duration-300">
      {/* Product Image (Contained) */}
      <div 
        onClick={() => onOpenDetail && onOpenDetail(product)}
        className="relative h-48 w-full bg-[#f5f5f7] overflow-hidden flex items-center justify-center p-3 cursor-pointer"
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#86868b] gap-1.5">
            <Package className="w-8 h-8 stroke-1" />
            <span className="text-[11px] font-medium">No Preview</span>
          </div>
        )}

        {/* Stock Badge */}
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#ff3b30]/12 text-[#d70015] border border-[#ff3b30]/25">
              Out of Stock
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#30d158]/12 text-[#248a3d] border border-[#30d158]/25">
              {product.quantity || product.stock} in stock
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 
            onClick={() => onOpenDetail && onOpenDetail(product)}
            className="text-sm font-semibold text-[#1d1d1f] tracking-tight truncate hover:underline cursor-pointer"
          >
            {product.name}
          </h3>
          <p className="text-xs text-[#86868b] line-clamp-2 h-8 mt-1">
            {product.description || 'Premium retail product.'}
          </p>
        </div>

        <div className="pt-3 mt-3 border-t border-black/8 flex items-center justify-between">
          <span className="text-base font-bold text-[#1d1d1f]">
            ${Number(product.price || 0).toFixed(2)}
          </span>

          <button
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1d1d1f] hover:bg-[#333336] text-white text-xs font-semibold shadow-md shadow-black/15 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
```

---

### B. Slide-Out Shopping Cart Drawer Blueprint

```jsx
import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

const CartDrawer = ({ isOpen, onClose, cartItems, onUpdateQty, onRemove, onProceedCheckout }) => {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-black/8 shadow-[0_20px_60px_rgba(0,0,0,0.18)] flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 border-b border-black/8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#1d1d1f]" />
              <h2 className="text-base font-bold text-[#1d1d1f]">Your Shopping Cart</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-black/5 text-[#86868b] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 text-[#86868b]">
                <ShoppingBag className="w-12 h-12 stroke-1 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Your cart is currently empty.</p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-[#f5f5f7] rounded-2xl border border-black/5">
                  <div className="w-16 h-16 rounded-xl bg-white p-1 shrink-0 flex items-center justify-center border border-black/8">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-[#1d1d1f] truncate">{item.name}</h4>
                    <p className="text-xs font-bold text-[#1d1d1f] mt-0.5">${Number(item.price).toFixed(2)}</p>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button 
                        onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-md bg-white border border-black/8 text-xs font-bold flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="text-xs font-semibold">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-md bg-white border border-black/8 text-xs font-bold flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={() => onRemove(item.id)}
                    className="p-2 text-[#86868b] hover:text-[#ff3b30] transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Bar */}
          <div className="p-6 bg-[#f5f5f7] border-t border-black/8 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#86868b]">Subtotal</span>
              <span className="text-lg font-bold text-[#1d1d1f]">${subtotal.toFixed(2)}</span>
            </div>

            <button
              disabled={cartItems.length === 0}
              onClick={onProceedCheckout}
              className="w-full py-3 rounded-full bg-[#1d1d1f] hover:bg-[#333336] text-white text-xs font-semibold shadow-md shadow-black/15 transition flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
```

---

### C. Checkout & Payment Process Modal Blueprint

```jsx
import React, { useState } from 'react';
import { X, Check, ShieldCheck, CreditCard, Banknote } from 'lucide-react';

const CheckoutModal = ({ isOpen, onClose, cartItems, totalAmount, onSubmitOrder }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH'); // 'CASH' | 'KHQR' | 'CARD'
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const orderPayload = {
      customerName,
      customerPhone,
      orderItems: cartItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
    };

    await onSubmitOrder(orderPayload);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.18)] border border-black/8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/8">
          <div>
            <h2 className="text-lg font-bold text-[#1d1d1f]">Checkout & Payment</h2>
            <p className="text-xs text-[#86868b] mt-0.5">Complete your order details below</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-black/5 text-[#86868b]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Serey Mongkol"
              className="w-full rounded-xl px-4 py-2.5 text-xs text-[#1d1d1f] bg-[#f5f5f7] border border-black/8 focus:border-[#1d1d1f] focus:bg-white focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="e.g. 012 345 678"
              className="w-full rounded-xl px-4 py-2.5 text-xs text-[#1d1d1f] bg-[#f5f5f7] border border-black/8 focus:border-[#1d1d1f] focus:bg-white focus:outline-none transition"
            />
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'CASH', label: 'Cash / COD', icon: Banknote },
                { id: 'KHQR', label: 'ABA KHQR', icon: ShieldCheck },
                { id: 'CARD', label: 'Credit Card', icon: CreditCard },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition ${
                      isSelected
                        ? 'border-[#1d1d1f] bg-[#1d1d1f] text-white shadow-xs'
                        : 'border-black/8 bg-[#f5f5f7] text-[#1d1d1f] hover:bg-black/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Order Summary Line */}
          <div className="p-4 rounded-2xl bg-[#f5f5f7] border border-black/8 flex justify-between items-center">
            <span className="text-xs font-medium text-[#86868b]">Total Payable</span>
            <span className="text-lg font-bold text-[#1d1d1f]">${Number(totalAmount).toFixed(2)}</span>
          </div>

          {/* Submit CTA */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-black/10 text-xs font-semibold text-[#1d1d1f] hover:bg-black/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-full bg-[#1d1d1f] hover:bg-[#333336] text-white text-xs font-semibold shadow-md shadow-black/15 transition flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? 'Placing Order...' : 'Confirm Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;
```

---

## 6. Backend API Payload Reference for Orders

When Nhazz connects the checkout button to the Spring Boot backend:

- **Endpoint**: `POST /api/v1/orders`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "customerName": "Customer Name",
    "customerPhone": "012345678",
    "orderItems": [
      {
        "productId": 1,
        "quantity": 2,
        "unitPrice": 59.99
      }
    ]
  }
  ```
- **Backend Response**:
  ```json
  {
    "success": true,
    "status": 201,
    "message": "Order created successfully",
    "data": {
      "id": 10,
      "orderNumber": "ORD-20260930-001",
      "totalAmount": 119.98,
      "status": "COMPLETED",
      "customerName": "Customer Name",
      "items": [ ... ]
    }
  }
  ```
