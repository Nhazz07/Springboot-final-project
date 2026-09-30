import React from 'react';
import { ShoppingBag, Sparkles } from 'lucide-react';

/**
 * User Landing Page / Customer Storefront
 * Blank canvas designated for Nhazz to build the shopping landing page,
 * featured product carousels, promotion banners, and checkout.
 */
const UserLanding = () => {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-8 text-center select-none">
      <div className="w-16 h-16 rounded-3xl bg-black/5 border border-black/8 flex items-center justify-center text-[#86868b] mb-4">
        <ShoppingBag className="w-8 h-8" />
      </div>

      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 border border-black/8 text-xs font-semibold text-[#86868b] mb-3">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Customer Storefront</span>
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f]">
        Welcome to IMS Store
      </h1>

      <p className="text-sm text-[#86868b] max-w-md mt-2 leading-relaxed">
        Landing page workspace reserved for Nhazz — Customer storefront hero, featured collections, and interactive shopping cart.
      </p>
    </div>
  );
};

export default UserLanding;
