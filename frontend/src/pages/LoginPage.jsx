import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Landmark, LogIn, AlertCircle, ShieldCheck, ArrowRight } from "lucide-react";
import AnimatedPage from "../components/common/AnimatedPage";

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
        err.response?.data?.message || "Invalid credentials. Please verify your national email and password."
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
    <AnimatedPage className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xs rounded-3xl border border-brown-200 p-8 shadow-xs space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brown-800 text-amber-200 flex items-center justify-center mx-auto shadow-xs border border-brown-700">
            <Landmark className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-brown-950 font-serif">
            Portal Access
          </h2>
          <p className="text-xs text-brown-500 font-medium">
            Civic Consultation & Policy Deliberation System
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-gov-red flex items-center space-x-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brown-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. officer@civis.gov or citizen@example.com"
              className="w-full p-3 rounded-xl border border-brown-200 bg-brown-50/30 text-brown-900 placeholder-brown-400 text-sm focus:ring-2 focus:ring-brown-500/30 focus:border-brown-500 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brown-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 rounded-xl border border-brown-200 bg-brown-50/30 text-brown-900 placeholder-brown-400 text-sm focus:ring-2 focus:ring-brown-500/30 focus:border-brown-500 focus:outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="interactive-btn w-full py-3 rounded-xl bg-brown-700 hover:bg-brown-800 text-brown-50 font-semibold text-sm shadow-xs transition-all disabled:opacity-50 border border-brown-800"
          >
            {isSubmitting ? "Authenticating..." : "Sign In to Portal"}
          </button>
        </form>

        {/* Demo Credentials Helper */}
        <div className="pt-4 border-t border-brown-100 text-center">
          <button
            type="button"
            onClick={setTestAdmin}
            className="interactive-btn inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-amber-50 text-amber-900 text-xs font-semibold hover:bg-amber-100 border border-amber-200 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-accent-gold" />
            <span>Load Policy Officer Demo (admin@civis.vote)</span>
          </button>
        </div>

        <p className="text-xs text-center text-brown-500">
          New citizen participant?{" "}
          <Link to="/register" className="font-bold text-accent-gold hover:underline">
            Register for verification
          </Link>
        </p>
      </div>
    </AnimatedPage>
  );
}
