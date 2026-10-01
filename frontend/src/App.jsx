import React from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import {
    AuthProvider,
    useAuth,
} from "./context/AuthContext";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import Layout from "./components/layout/Layout";

// Customer storefront

import UserLanding from "./pages/UserLanding";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import PurchaseHistory from "./pages/PurchaseHistory";

// Auth

import Login from "./pages/Login";

// Admin page

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Suppliers from "./pages/Suppliers";
import POS from "./pages/POS";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Users from "./pages/Users";
import Catalog from "./pages/Catalog";


// Home route

const HomeRoute = () => {
    const { isAdmin } = useAuth();

    return isAdmin
        ? <Dashboard />
        : <UserLanding />;
};


// Default route

const DefaultRoute = () => {
    const { isAdmin } = useAuth();

    return isAdmin
        ? <Navigate to="/dashboard" replace />
        : <UserLanding />;
};


// App

function App() {
    return (
        <BrowserRouter>

            <AuthProvider>

                <Routes>

                 {/*Login*/}

                    <Route
                        path="/login"
                        element={<Login />}
                    />


                   {/*Public storefront*/}

                    <Route element={<Layout />}>

                        {/* Storefront */}
                        <Route
                            path="/"
                            element={<DefaultRoute />}
                        />
                        <Route
                            path="/catalog"
                            element={<Catalog />}
                        />

                        {/* Product Details */}
                        <Route
                            path="/products/:id"
                            element={<ProductDetail />}
                        />

                        {/* Shopping Cart */}
                        <Route
                            path="/cart"
                            element={<Cart />}
                        />

                        {/* Checkout
                            Guest CAN access this page */}
                        <Route
                            path="/checkout"
                            element={<Checkout />}
                        />

                    </Route>


                 {/*Project route*/}

                    <Route
                        element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }
                    >
{/*General home*/}

                        <Route
                            path="/home"
                            element={<HomeRoute />}
                        />


                       {/*Login user landing*/}

                        <Route
                            path="/landing"
                            element={
                                <ProtectedRoute userOnly>
                                    <UserLanding />
                                </ProtectedRoute>
                            }
                        />


                       {/*Admin dashboard*/}

                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute adminOnly>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />


                        {/*Admin product*/}

                        <Route
                            path="/products"
                            element={<Products />}
                        />


                      {/*Admin category*/}

                        <Route
                            path="/categories"
                            element={
                                <ProtectedRoute adminOnly>
                                    <Categories />
                                </ProtectedRoute>
                            }
                        />


                       {/*Admin supplier*/}

                        <Route
                            path="/suppliers"
                            element={
                                <ProtectedRoute adminOnly>
                                    <Suppliers />
                                </ProtectedRoute>
                            }
                        />


                        {/*Admin user*/}

                        <Route
                            path="/users"
                            element={
                                <ProtectedRoute adminOnly>
                                    <Users />
                                </ProtectedRoute>
                            }
                        />


                   {/*Pos*/}

                        <Route
                            path="/pos"
                            element={<POS />}
                        />


                        {/*Admin order*/}

                        <Route
                            path="/orders"
                            element={<Orders />}
                        />


                       {/*profile*/}

                        <Route
                            path="/profile"
                            element={<Profile />}
                        />


                        {/*order success login require*/}

                        <Route
                            path="/order-success/:id"
                            element={<OrderSuccess />}
                        />



                            {/*PURCHASE HISTORY,LOGIN REQUIRED*/}


                        <Route
                            path="/purchase-history"
                            element={<PurchaseHistory />}
                        />

                    </Route>


                   {/*catch all*/}

                    <Route
                        path="*"
                        element={
                            <Navigate
                                to="/"
                                replace
                            />
                        }
                    />

                </Routes>

            </AuthProvider>

        </BrowserRouter>
    );
}

export default App;