import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MenuManager from './pages/MenuManager';
import OrderManager from './pages/OrderManager';
import Sidebar from './components/Sidebar';
import './App.css';

function ProtectedLayout({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="fullscreen-center"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" />;
  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">{children}</main>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
      <Route path="/menu" element={<ProtectedLayout><MenuManager /></ProtectedLayout>} />
      <Route path="/orders" element={<ProtectedLayout><OrderManager /></ProtectedLayout>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
