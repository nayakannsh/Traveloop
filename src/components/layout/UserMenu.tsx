"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, Settings, Shield, ChevronDown } from "lucide-react";
import { signOut } from "next-auth/react";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : user.email?.[0].toUpperCase() || "U";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-sand-100 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 rounded-full bg-amber-gold text-white flex items-center justify-center text-xs font-bold border-2 border-sand-50 shadow-sm">
          {user.image ? (
            <img src={user.image} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <ChevronDown size={14} className={`text-sand-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-sand-50 border border-sand-200 rounded-xl shadow-xl z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in duration-150">
          <div className="px-4 py-2.5 border-b border-sand-100 mb-1">
            <p className="text-sm font-semibold text-sand-900 truncate">{user.name || "Traveler"}</p>
            <p className="text-xs text-sand-400 truncate">{user.email}</p>
          </div>

          <Link
            href="/profile"
            className="flex items-center gap-3 px-4 py-2 text-sm text-sand-700 hover:bg-sand-50 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <User size={16} className="text-sand-400" />
            Profile Settings
          </Link>

          {user.role === "ADMIN" && (
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-2 text-sm text-sand-700 hover:bg-sand-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Shield size={16} className="text-amber-gold" />
              Admin Panel
            </Link>
          )}

          <div className="h-px bg-sand-100 my-1" />

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-danger hover:bg-red-danger/5 transition-colors text-left"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}
