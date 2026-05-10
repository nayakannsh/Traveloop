"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, User, LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import Logo from "@/components/common/Logo";

export default function Navbar({ session }: { session?: any }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLoggedIn = !!session?.user;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cream-50/70 backdrop-blur-xl border-b border-cream-200/50">
      <nav
        className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4"
        aria-label="Main navigation"
      >
        <Logo />

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-cream-600">
          <Link href="/explore" className="hover:text-emerald transition-colors">
            Explore
          </Link>
          
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="hover:text-emerald transition-colors">
                Dashboard
              </Link>
              <form action={logoutAction}>
                <button 
                  type="submit" 
                  className="flex items-center gap-2 hover:text-red-danger transition-colors text-xs font-bold uppercase tracking-widest"
                  suppressHydrationWarning
                >
                  <LogOut size={14} />
                  <span>Log Out</span>
                </button>
              </form>
              <Link href="/profile" className="w-9 h-9 rounded-full bg-emerald/10 border border-emerald/20 flex items-center justify-center text-emerald hover:bg-emerald/20 transition-all">
                <User size={16} />
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="hover:text-emerald transition-colors">
                Sign In
              </Link>
              <Link href="/auth/signup" className="btn-primary text-xs py-2.5 px-7">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 rounded-xl hover:bg-cream-100 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-cream-200 bg-cream-50 px-6 pb-6 pt-4 space-y-3">
          <Link
            href="/explore"
            className="block py-2.5 text-cream-700 font-medium"
            onClick={() => setMobileOpen(false)}
          >
            Explore
          </Link>
          
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="block py-2.5 text-cream-700 font-medium"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>
              <form action={logoutAction} className="w-full">
                <button 
                  type="submit" 
                  className="w-full text-left py-2.5 text-red-danger font-medium"
                  onClick={() => setMobileOpen(false)}
                  suppressHydrationWarning
                >
                  Log Out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="block py-2.5 text-cream-700 font-medium"
                onClick={() => setMobileOpen(false)}
              >
                Log In
              </Link>
              <Link
                href="/auth/signup"
                className="btn-primary w-full text-center mt-2"
                onClick={() => setMobileOpen(false)}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
