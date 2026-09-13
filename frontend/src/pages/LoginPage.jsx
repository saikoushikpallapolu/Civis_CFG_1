import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Vote, LogIn, AlertCircle, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const user = await login({ email, password });
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid email or password. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const setTestAdmin = () => {
    setEmail("admin@civis.vote");
    setPassword("Admin@123");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-8 shadow-xl shadow-slate-200/50 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-200">
            <Vote className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 font-outfit">
            Sign In to Civis
          </h2>
          <p className="text-xs text-slate-500">
            Access citizen consultations or policymaker analytics
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. citizen@example.com"
              className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Demo Credentials Helper */}
        <div className="pt-4 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={setTestAdmin}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 text-xs font-semibold hover:bg-amber-100 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Fill Admin Demo Credentials (admin@civis.vote)</span>
          </button>
        </div>

        <p className="text-xs text-center text-slate-500">
          Don't have an account?{" "}
          <Link to="/register" className="font-bold text-indigo-600 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
