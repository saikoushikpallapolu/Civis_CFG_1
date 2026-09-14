import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import LanguageSelector from "./LanguageSelector";
import { motion, AnimatePresence } from "framer-motion";
import {
  Vote,
  LayoutDashboard,
  FilePlus2,
  LogIn,
  LogOut,
  Menu,
  X,
  Sparkles,
  Landmark,
} from "lucide-react";

export default function Navbar() {
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-brown-50/90 backdrop-blur-md border-b border-brown-200 transition-colors">
      {/* Top subtle tri-color government accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-accent-gold via-brown-600 to-gov-teal opacity-80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link
            to="/"
            className="flex items-center space-x-3 group"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-brown-700 via-brown-800 to-brown-900 flex items-center justify-center text-accent-amber shadow-md shadow-brown-900/10 border border-brown-600/40"
            >
              <Landmark className="w-5 h-5 text-amber-100" />
            </motion.div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-brown-900 font-serif">
                  Civis
                </span>
                <span className="text-accent-gold text-lg leading-none font-bold">.</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-brown-200/70 text-brown-800 border border-brown-300/60 hidden sm:inline-block">
                  Civic Portal
                </span>
              </div>
              <p className="text-[10px] text-brown-500 font-medium tracking-wide hidden sm:block">
                {t("nav_portal_sub")}
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 relative">
            <Link
              to="/consultations"
              className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/consultations")
                  ? "text-brown-900 font-semibold"
                  : "text-brown-600 hover:text-brown-900 hover:bg-brown-100/60"
              }`}
            >
              {t("nav_consultations")}
              {isActive("/consultations") && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-brown-700 rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>

            {isAdmin && (
              <>
                <Link
                  to="/admin/create"
                  className={`relative flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/admin/create")
                      ? "text-brown-900 font-semibold"
                      : "text-brown-600 hover:text-brown-900 hover:bg-brown-100/60"
                  }`}
                >
                  <FilePlus2 className="w-4 h-4 text-brown-700" />
                  <span>Draft Policy</span>
                  {isActive("/admin/create") && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-brown-700 rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>

                <Link
                  to="/admin"
                  className={`relative flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/admin")
                      ? "text-brown-900 font-semibold"
                      : "text-brown-600 hover:text-brown-900 hover:bg-brown-100/60"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-brown-700" />
                  <span>{t("nav_officer_hub")}</span>
                  {isActive("/admin") && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-brown-700 rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              </>
            )}
          </nav>

          {/* Right Auth / Profile & Language Section */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Global Language Selector Dropdown */}
            <LanguageSelector />

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-brown-900">
                    {user?.name}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wider ${
                      isAdmin
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                    }`}
                  >
                    {isAdmin ? "POLICY OFFICER" : "CITIZEN"}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="interactive-btn flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-brown-200 text-brown-700 hover:text-brown-950 hover:border-brown-300 hover:bg-brown-100/80 text-sm font-medium"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4 text-brown-500" />
                  <span>{t("nav_logout")}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="interactive-btn flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-brown-700 hover:text-brown-900 hover:bg-brown-100/70"
                >
                  <LogIn className="w-4 h-4 text-brown-500" />
                  <span>{t("nav_login")}</span>
                </Link>
                <Link
                  to="/register"
                  className="interactive-btn px-4 py-1.5 rounded-lg text-sm font-medium bg-brown-700 hover:bg-brown-800 text-brown-50 shadow-xs border border-brown-800"
                >
                  {t("nav_register")}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu hamburger button */}
          <div className="flex md:hidden items-center space-x-2">
            <LanguageSelector />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-brown-700 hover:bg-brown-100 border border-brown-200"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-b border-brown-200 bg-brown-50/95 backdrop-blur-lg px-4 pt-2 pb-4 space-y-2 overflow-hidden"
          >
            <Link
              to="/consultations"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                isActive("/consultations")
                  ? "bg-brown-200 text-brown-900 font-semibold"
                  : "text-brown-700 hover:bg-brown-100"
              }`}
            >
              {t("nav_consultations")}
            </Link>

            {isAdmin && (
              <>
                <Link
                  to="/admin/create"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive("/admin/create")
                      ? "bg-brown-200 text-brown-900 font-semibold"
                      : "text-brown-700 hover:bg-brown-100"
                  }`}
                >
                  <FilePlus2 className="w-4 h-4 text-brown-600" />
                  <span>Draft Policy</span>
                </Link>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive("/admin")
                      ? "bg-brown-200 text-brown-900 font-semibold"
                      : "text-brown-700 hover:bg-brown-100"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-brown-600" />
                  <span>{t("nav_officer_hub")}</span>
                </Link>
              </>
            )}

            <div className="pt-3 border-t border-brown-200 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center justify-between px-3 py-1">
                    <span className="text-sm font-medium text-brown-900">{user?.name}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isAdmin
                          ? "bg-amber-100 text-amber-900"
                          : "bg-emerald-100 text-emerald-900"
                      }`}
                    >
                      {isAdmin ? "OFFICER" : "CITIZEN"}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center space-x-2 w-full px-3 py-2 rounded-lg border border-brown-200 text-brown-700 hover:bg-brown-100 text-sm font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t("nav_logout")}</span>
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg border border-brown-200 text-brown-800 text-sm font-medium text-center"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{t("nav_login")}</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg bg-brown-700 text-brown-50 text-sm font-medium text-center"
                  >
                    {t("nav_register")}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
