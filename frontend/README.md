#  Inventory Management System — Frontend SPA

A modern, high-performance Single Page Application (SPA) built with **React 19**, **Vite 8**, and **Tailwind CSS v4**, adhering to Apple's clean design philosophy.

---

## 🎨 Design Philosophy & Aesthetic Tokens

- **Canvas Background**: Athens Gray (`#f5f5f7`)
- **Primary Interactive Color**: Apple Dark Slate (`#1D1D1F`) with hover (`#333336`) and click depression (`#000000`)
- **Card Surfaces**: Clean `#ffffff` with subtle borders (`rgba(0, 0, 0, 0.08)`) and enhanced shadow depth
- **Glassmorphic Overlays**: Frosted navigation panels (`background: rgba(255, 255, 255, 0.92)` with `backdrop-filter: blur(20px)`)
- **Status Indicators**:
  - In Stock / Healthy: `#30d158` (Apple Green)
  - Low Stock Warning: `#ff9f0a` (Apple Orange)
  - Critical / Danger: `#ff3b30` (Apple Red)

---

## 🛠️ Features & Page Index

1. **Gatekeeper & Authentication (`/login`)**:
   - Frosted glass sign-in and sign-up with password confirmation.
   - Quick-switch developer login pills (`mongkol`, `nhazz`, `admin`).
   - Stateless JWT Bearer token management with Axios request interceptors.

2. **Executive BI Dashboard (`/`)**:
   - Live KPI cards: Total Inventory Valuation, Active Product SKUs, Low-Stock Radar, and Gross Sales.
   - Direct launch action to Point of Sale (POS) station.

3. **Product Catalog & Multi-Image Cloudinary Hub (`/products`)**:
   - Responsive grid view with cover photo badges and list table view.
   - Dynamic real-time search and category filtering.
   - Multi-image upload on product creation and editing.
   - Interactive in-modal photo gallery: set primary cover photo with 1-click or delete individual photos.
   - Cloudinary folder targeting: `etec_springboot_final_project/etec_springboot_final_project_product`.

4. **Category & Supplier Directory (`/categories`, `/suppliers`)**:
   - Modal-based CRUD operations with uniqueness safeguards.
   - Supplier logo upload targeting `etec_springboot_final_project_supplier` with automatic cloud replacement.

5. **Profile & Account Settings (`/profile`)**:
   - Direct Cloudinary avatar upload with instant navbar & sidebar synchronization (`etec_springboot_final_project_profile`).
   - Email updates and role verification.

6. **Point of Sale (POS) Station (`/pos`)** *(Module assigned to Nhazz)*:
   - Barcode/SKU search, live cart calculation, and receipt generation.

7. **Order History & Restocking (`/orders`)** *(Module assigned to Nhazz)*:
   - Order tracking with cancellation and automated stock restoral.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (Node 20+ recommended)
- Spring Boot backend running on `http://localhost:3000`

### Setup & Run
```bash
# 1. Install dependencies
npm install

# 2. Launch Vite dev server
npm run dev
```

The application will be available at `http://localhost:5173`.

### Production Build
```bash
npm run build
```
This produces optimized production assets in the `dist/` directory.
