import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
          <Navbar />
          <main className="flex-1">
            <Routes>
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
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
