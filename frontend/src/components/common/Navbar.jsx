import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Vote,
  LayoutDashboard,
  FilePlus2,
  BarChart3,
  LogIn,
  LogOut,
  User,
  ShieldAlert,
} from "lucide-react";

export default function Navbar() {
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 font-outfit">
                Civis<span className="text-indigo-600">.</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                Civic Intelligence
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/consultations"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/consultations")
                  ? "bg-slate-100 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Consultations
            </Link>

            {isAdmin && (
              <>
                <Link
                  to="/admin/create"
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/admin/create")
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <FilePlus2 className="w-4 h-4 text-indigo-600" />
                  <span>AI Studio</span>
                </Link>

                <Link
                  to="/admin"
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/admin")
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                  <span>Admin Hub</span>
                </Link>
              </>
            )}
          </nav>

          {/* Right Auth / Profile Section */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-semibold text-slate-800">
                    {user?.name}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-1.5 py-0.2 rounded ${
                      isAdmin
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {isAdmin ? "OFFICER / ADMIN" : "CITIZEN"}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 text-sm font-medium transition-all"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
