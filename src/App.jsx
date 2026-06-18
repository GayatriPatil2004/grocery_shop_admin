import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './shared/context/AuthContext';
import ProtectedRoute from './shared/components/layout/ProtectedRoute';
import Layout from './shared/components/layout/Layout';
import Login from './features/auth/Login';
import Dashboard from './features/dashboard/Dashboard';
import CategoryList from './features/categories/components/CategoryList';
import ProductList from './features/products/components/ProductList';
import OrderList from './features/orders/components/OrderList';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Administrative Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/categories" element={<CategoryList />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/orders" element={<OrderList />} />
            </Route>
          </Route>

          {/* Catch-all fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      
      {/* Toast Notification Container */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#13132e',
            color: '#fff',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.08)'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  );
}
