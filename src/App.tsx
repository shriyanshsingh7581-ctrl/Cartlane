/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { HomePage } from './pages/HomePage';
import {
  CollectionsPage,
  CollectionDetailPage,
  ProductsPage,
} from './pages/CatalogPages';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage, CheckoutPage } from './pages/CartCheckoutPages';
import {
  LoginPage,
  AccountDashboardPage,
  OrderDetailPage,
  TrackOrderLookupPage,
} from './pages/AccountPages';
import {
  WishlistPage,
  OffersPage,
  ContactPage,
  PolicyPage,
  NotFoundPage,
} from './pages/UtilityPages';
import { AdminLoginPage, AdminPortal } from './pages/AdminPages';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
};

const ToastBanner: React.FC = () => {
  const { toast } = useStore();
  if (!toast) return null;

  return (
    <div className="fixed bottom-16 md:bottom-6 left-4 right-4 md:left-auto md:right-6 z-50 md:max-w-sm px-5 py-3.5 shadow-xl border text-xs font-medium tracking-wide bg-[#141413] text-[#FAF8F5] border-[#3F3B36]">
      {toast.text}
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col justify-between bg-[#FAF8F5] text-[#141413]">
          <Navbar />
          <CartDrawer />
          <div className="flex-1">
            <Routes>
              {/* Public Storefront Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/collections" element={<CollectionsPage />} />
              <Route path="/collections/:slug" element={<CollectionDetailPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:slug" element={<ProductDetailPage />} />
              <Route path="/search" element={<ProductsPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Authenticated Customer Account Routes */}
              <Route path="/account" element={<AccountDashboardPage />} />
              <Route path="/account/profile" element={<AccountDashboardPage />} />
              <Route path="/account/addresses" element={<AccountDashboardPage />} />
              <Route path="/account/orders" element={<AccountDashboardPage />} />
              <Route path="/account/orders/:orderId" element={<OrderDetailPage />} />

              {/* Storefront Utilities & Policies */}
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/track-order" element={<TrackOrderLookupPage />} />
              <Route path="/offers" element={<OffersPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/policies/:policyType" element={<PolicyPage />} />

              {/* Complete Administrator Panel Routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminPortal />} />
              <Route path="/admin/products" element={<AdminPortal />} />
              <Route path="/admin/products/new" element={<AdminPortal />} />
              <Route path="/admin/products/:productId" element={<AdminPortal />} />
              <Route path="/admin/categories" element={<AdminPortal />} />
              <Route path="/admin/collections" element={<AdminPortal />} />
              <Route path="/admin/orders" element={<AdminPortal />} />
              <Route path="/admin/orders/:orderId" element={<AdminPortal />} />
              <Route path="/admin/customers" element={<AdminPortal />} />
              <Route path="/admin/banners" element={<AdminPortal />} />
              <Route path="/admin/homepage" element={<AdminPortal />} />
              <Route path="/admin/coupons" element={<AdminPortal />} />
              <Route path="/admin/reviews" element={<AdminPortal />} />
              <Route path="/admin/inventory" element={<AdminPortal />} />
              <Route path="/admin/shipping" element={<AdminPortal />} />
              <Route path="/admin/settings" element={<AdminPortal />} />

              {/* Fallback 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
          <Footer />
          <ToastBanner />
        </div>
      </StoreProvider>
    </BrowserRouter>
  );
}
