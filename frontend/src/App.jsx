import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ConsultationListPage from "./pages/ConsultationListPage";
import ConsultationDetailPage from "./pages/ConsultationDetailPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import CreateConsultationPage from "./pages/CreateConsultationPage";
import AnalyticsDashboardPage from "./pages/AnalyticsDashboardPage";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/consultations" element={<ConsultationListPage />} />
        <Route path="/consultations/:id" element={<ConsultationDetailPage />} />

        {/* Admin Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/create"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CreateConsultationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/consultations/:id/analytics"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AnalyticsDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen bg-brown-50 text-brown-900 transition-colors">
            <Navbar />
            <main className="flex-1">
              <AnimatedRoutes />
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}
