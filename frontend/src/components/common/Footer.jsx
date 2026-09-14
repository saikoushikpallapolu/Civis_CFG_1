import React from "react";
import { Link } from "react-router-dom";
import { Landmark, ShieldCheck } from "lucide-react";
import StatusPulse from "./StatusPulse";

export default function Footer() {
  return (
    <footer className="bg-brown-950 text-brown-200 border-t border-brown-800/80 mt-auto">
      {/* Subtle national tricolor top bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-accent-gold/40 via-brown-600/40 to-gov-teal/40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-brown-800/60">
          {/* Col 1: Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-brown-800 text-amber-100 flex items-center justify-center border border-brown-700/60">
                <Landmark className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-brown-100 font-serif">
                Civis Public Consultation
              </span>
            </div>
            <p className="text-xs text-brown-400 max-w-md leading-relaxed">
              Official electronic civic consultation and legislative analysis system. Empowering citizens to directly shape statutory provisions with transparent, AI-synthesized public commentary.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <StatusPulse label="Analytical Engine Active" status="active" />
              <span className="text-[11px] text-brown-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-gov-teal" /> 256-bit Encrypted
              </span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-brown-300">
              Consultations
            </h4>
            <ul className="space-y-1.5 text-xs text-brown-400">
              <li>
                <Link to="/consultations" className="hover:text-brown-100 transition-colors">
                  Open Consultations
                </Link>
              </li>
              <li>
                <Link to="/consultations?status=closed" className="hover:text-brown-100 transition-colors">
                  Closed Deliberations
                </Link>
              </li>
              <li>
                <Link to="/consultations" className="hover:text-brown-100 transition-colors">
                  Archive Reports
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Standards */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-brown-300">
              Transparency
            </h4>
            <ul className="space-y-1.5 text-xs text-brown-400">
              <li>
                <span className="hover:text-brown-100 cursor-pointer transition-colors">
                  Citizen Participation Guidelines
                </span>
              </li>
              <li>
                <span className="hover:text-brown-100 cursor-pointer transition-colors">
                  Data Governance & Privacy
                </span>
              </li>
              <li>
                <span className="hover:text-brown-100 cursor-pointer transition-colors">
                  Digital Accessibility (WCAG 2.1)
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-brown-400">
          <p>© {new Date().getFullYear()} Civis Civic Consultation Portal. All rights reserved.</p>
          <p className="text-brown-400">
            Official Platform for Citizen Feedback & Statutory Analysis
          </p>
        </div>
      </div>
    </footer>
  );
}
