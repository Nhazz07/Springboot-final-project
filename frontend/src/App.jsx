import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Suppliers from './pages/Suppliers';
import POS from './pages/POS';
import Profile from './pages/Profile';
import Users from './pages/Users';
import UserLanding from './pages/UserLanding';

// Smart Home Route: Dashboard for Admin, User Landing Page for Standard Users
const HomeRoute = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <Dashboard /> : <UserLanding />;
};

const DefaultRoute = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <Navigate to="/dashboard" replace /> : <UserLanding />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Public landing page inside the user-style layout */}
          <Route element={<Layout />}>
            <Route path="/" element={<DefaultRoute />} />
          </Route>

          {/* Protected Routes inside App Layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/home" element={<HomeRoute />} />
            <Route
              path="/landing"
              element={
                <ProtectedRoute userOnly>
                  <UserLanding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute adminOnly>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/products" element={<Products />} />
            <Route
              path="/categories"
              element={
                <ProtectedRoute adminOnly>
                  <Categories />
                </ProtectedRoute>
              }
            />
            <Route
              path="/suppliers"
              element={
                <ProtectedRoute adminOnly>
                  <Suppliers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute adminOnly>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route path="/pos" element={<POS />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
