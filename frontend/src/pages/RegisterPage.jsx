import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Landmark, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";
import AnimatedPage from "../components/common/AnimatedPage";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("citizen"); // "citizen" | "admin"
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const user = await register({ name, email, password, role });
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/consultations");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please check your information."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatedPage className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xs rounded-3xl border border-brown-200 p-8 shadow-xs space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brown-800 text-amber-200 flex items-center justify-center mx-auto shadow-xs border border-brown-700">
            <Landmark className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-brown-950 font-serif">
            Portal Registration
          </h2>
          <p className="text-xs text-brown-500 font-medium">
            Establish a verified profile for public policy consultations
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
              Full Legal Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              className="w-full p-3 rounded-xl border border-brown-200 bg-brown-50/30 text-brown-900 placeholder-brown-400 text-sm focus:ring-2 focus:ring-brown-500/30 focus:border-brown-500 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brown-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. priya@example.com"
              className="w-full p-3 rounded-xl border border-brown-200 bg-brown-50/30 text-brown-900 placeholder-brown-400 text-sm focus:ring-2 focus:ring-brown-500/30 focus:border-brown-500 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brown-700 uppercase tracking-wider mb-1.5">
              Account Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full p-3 rounded-xl border border-brown-200 bg-brown-50/30 text-brown-900 placeholder-brown-400 text-sm focus:ring-2 focus:ring-brown-500/30 focus:border-brown-500 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brown-700 uppercase tracking-wider mb-1.5">
              Participation Role
            </label>
            <div className="grid grid-cols-2 gap-2 bg-brown-100/70 p-1 rounded-xl border border-brown-200">
              <button
                type="button"
                onClick={() => setRole("citizen")}
                className={`relative py-2.5 px-3 rounded-lg text-xs font-bold transition-all text-center ${
                  role === "citizen"
                    ? "text-brown-950 bg-white shadow-xs border border-brown-200"
                    : "text-brown-600 hover:text-brown-900"
                }`}
              >
                <span>Citizen Participant</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`relative py-2.5 px-3 rounded-lg text-xs font-bold transition-all text-center ${
                  role === "admin"
                    ? "text-amber-950 bg-white shadow-xs border border-amber-300"
                    : "text-brown-600 hover:text-brown-900"
                }`}
              >
                <span>Policy Officer / Lawmaker</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="interactive-btn w-full py-3 rounded-xl bg-brown-700 hover:bg-brown-800 text-brown-50 font-semibold text-sm shadow-xs transition-all disabled:opacity-50 border border-brown-800 mt-2"
          >
            {isSubmitting ? "Creating Registration..." : "Complete Registration"}
          </button>
        </form>

        <p className="text-xs text-center text-brown-500">
          Already registered on the platform?{" "}
          <Link to="/login" className="font-bold text-accent-gold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AnimatedPage>
  );
}
