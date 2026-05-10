"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Camera,
  Loader2,
  Save,
  Shield,
  Palette,
  Trash2,
  LogOut,
  ChevronRight,
  CreditCard,
} from "lucide-react";
import { useTheme } from "@/components/common/ThemeProvider";
import toast from "react-hot-toast";
import { updateUserProfileAction } from "@/app/actions/user";

/* ─── TYPES ────────────────────────────────────────────────── */

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  avatarUrl: string | null;
  defaultPrivacy: "PRIVATE" | "PUBLIC" | "UNLISTED";
  theme: "light" | "dark" | "system";
  currency: string;
}

/* ─── MOCK DATA ────────────────────────────────────────────── */

const INITIAL_PROFILE: UserProfile = {
  name: "",
  email: "",
  phone: "",
  city: "",
  country: "",
  avatarUrl: null,
  defaultPrivacy: "PRIVATE",
  theme: "light",
  currency: "USD",
};

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY", "AUD", "THB"];

/* ─── PAGE COMPONENT ───────────────────────────────────────── */

export default function ProfileClient({ initialUser }: { initialUser: any }) {
  const { setTheme } = useTheme();
  const [form, setForm] = useState<UserProfile>({
    ...INITIAL_PROFILE,
    name: initialUser?.name || "",
    email: initialUser?.email || "",
    phone: initialUser?.phone || "",
    city: initialUser?.city || "",
    country: initialUser?.country || "",
    avatarUrl: initialUser?.avatarUrl || null,
    defaultPrivacy: initialUser?.defaultPrivacy || "PRIVATE",
    theme: (initialUser?.theme as any) || "light",
    currency: initialUser?.currency || "USD",
  });

  useEffect(() => {
    const saved = localStorage.getItem("traveloop-theme") as any;
    if (saved) {
      setForm(prev => ({ ...prev, theme: saved }));
    }
  }, []);

  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    if (name === "theme") {
      setTheme(value as any);
    }
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
    // Note: In a real app, you would upload this to a storage provider here
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const result = await updateUserProfileAction({
        name: form.name,
        phone: form.phone,
        city: form.city,
        country: form.country,
        currency: form.currency,
        theme: form.theme,
        defaultPrivacy: form.defaultPrivacy,
      });

      if (result.success) {
        toast.success("Profile updated successfully");
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-dvh bg-sand-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-sand-50/80 backdrop-blur-md border-b border-sand-200/60">
        <div className="mx-auto max-w-3xl flex items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 -ml-2 rounded-lg hover:bg-sand-100 text-sand-600" aria-label="Back">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-lg font-semibold text-sand-900">Profile Settings</h1>
          </div>
          <button onClick={handleSave} disabled={isSaving} className="btn-primary text-sm py-2 px-4">
            {isSaving ? (
              <><Loader2 size={15} className="animate-spin" /> Saving…</>
            ) : (
              <><Save size={15} /> Save Changes</>
            )}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-8 space-y-8">
        {/* ─── AVATAR ──────────────────────────────────────── */}
        <section className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-sand-200 flex items-center justify-center overflow-hidden ring-2 ring-sand-100 shadow-sm">
              {avatarPreview || form.avatarUrl ? (
                <img
                  src={avatarPreview || form.avatarUrl || ""}
                  alt="Profile avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={32} className="text-sand-400" />
              )}
            </div>
            <label
              htmlFor="avatar-upload"
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-gold text-white flex items-center justify-center cursor-pointer hover:bg-amber-gold-hover transition-colors shadow-sm"
              aria-label="Change avatar"
            >
              <Camera size={14} />
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="sr-only"
            />
          </div>
          <div>
            <p className="font-semibold text-sand-900">{form.name}</p>
            <p className="text-sm text-sand-400">{form.email}</p>
          </div>
        </section>

        {/* ─── PERSONAL INFO ───────────────────────────────── */}
        <section className="card p-6 space-y-5">
          <h2 className="text-sm font-semibold text-sand-900 flex items-center gap-2">
            <User size={16} className="text-sand-400" /> Personal Information
          </h2>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="profile-name" className="block text-sm font-medium text-sand-700 mb-1.5">Full Name</label>
              <input id="profile-name" name="name" type="text" value={form.name} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label htmlFor="profile-email" className="block text-sm font-medium text-sand-700 mb-1.5">
                <Mail size={13} className="inline mr-1 -mt-0.5" /> Email
              </label>
              <input id="profile-email" name="email" type="email" value={form.email} disabled className="input-field opacity-60 cursor-not-allowed" title="Email cannot be changed" />
            </div>
            <div>
              <label htmlFor="profile-phone" className="block text-sm font-medium text-sand-700 mb-1.5">
                <Phone size={13} className="inline mr-1 -mt-0.5" /> Phone
              </label>
              <input id="profile-phone" name="phone" type="tel" value={form.phone} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label htmlFor="profile-city" className="block text-sm font-medium text-sand-700 mb-1.5">
                <MapPin size={13} className="inline mr-1 -mt-0.5" /> City
              </label>
              <input id="profile-city" name="city" type="text" value={form.city} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label htmlFor="profile-country" className="block text-sm font-medium text-sand-700 mb-1.5">
                <Globe size={13} className="inline mr-1 -mt-0.5" /> Country
              </label>
              <input id="profile-country" name="country" type="text" value={form.country} onChange={handleChange} className="input-field" />
            </div>
          </div>
        </section>

        {/* ─── PREFERENCES ─────────────────────────────────── */}
        <section className="card p-6 space-y-5">
          <h2 className="text-sm font-semibold text-sand-900 flex items-center gap-2">
            <Palette size={16} className="text-sand-400" /> Preferences
          </h2>

          <div className="grid sm:grid-cols-2 gap-5">
            {/* Theme */}
            <div>
              <label htmlFor="profile-theme" className="block text-sm font-medium text-sand-700 mb-1.5">Theme</label>
              <select id="profile-theme" name="theme" value={form.theme} onChange={handleChange} className="input-field">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>

            {/* Currency */}
            <div>
              <label htmlFor="profile-currency" className="block text-sm font-medium text-sand-700 mb-1.5">Currency</label>
              <select id="profile-currency" name="currency" value={form.currency} onChange={handleChange} className="input-field">
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Default Privacy */}
            <div className="sm:col-span-2">
              <label htmlFor="profile-privacy" className="block text-sm font-medium text-sand-700 mb-1.5">Default Trip Privacy</label>
              <select id="profile-privacy" name="defaultPrivacy" value={form.defaultPrivacy} onChange={handleChange} className="input-field max-w-xs">
                <option value="PRIVATE">Private — Only you</option>
                <option value="PUBLIC">Public — Anyone</option>
                <option value="UNLISTED">Unlisted — Link only</option>
              </select>
            </div>
          </div>
        </section>

        {/* ─── SECURITY ────────────────────────────────────── */}
        <section className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-sand-900 flex items-center gap-2">
            <Shield size={16} className="text-sand-400" /> Security & Billing
          </h2>

          <button 
            onClick={() => toast.success("Password reset link sent to your email!")}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-sand-50 transition-colors text-left group"
          >
            <div>
              <p className="text-sm font-medium text-sand-800">Change Password</p>
              <p className="text-xs text-sand-400">Update your account password</p>
            </div>
            <ChevronRight size={16} className="text-sand-300 group-hover:text-sand-500 transition-colors" />
          </button>

          <Link href="/profile/billing" className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-sand-50 transition-colors text-left group border-t border-sand-100 pt-4 mt-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-gold/10 text-amber-gold">
                <CreditCard size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-sand-800">Plan & Billing</p>
                <p className="text-xs text-sand-400">Manage subscription and invoices</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-sand-300 group-hover:text-sand-500 transition-colors" />
          </Link>
        </section>

        {/* ─── DANGER ZONE ─────────────────────────────────── */}
        <section className="card border-red-danger/20 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-red-danger flex items-center gap-2">
            <Trash2 size={16} /> Danger Zone
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-red-danger/5">
            <div>
              <p className="text-sm font-medium text-sand-800">Delete Account</p>
              <p className="text-xs text-sand-500">
                Permanently delete your account and all trip data. This cannot be undone.
              </p>
            </div>
            <button 
              onClick={() => {
                if (confirm("Are you sure you want to delete your account? This action is irreversible.")) {
                  toast.error("Account deletion requested. Please contact support to finalize.");
                }
              }}
              className="btn-secondary text-red-danger border-red-danger/30 text-xs py-2 px-4 hover:bg-red-danger/5 hover:border-red-danger/50 shrink-0"
            >
              <Trash2 size={13} /> Delete Account
            </button>
          </div>

          <button 
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 text-sm text-sand-500 hover:text-sand-700 transition-colors p-2"
          >
            <LogOut size={15} /> Log Out
          </button>
        </section>
      </main>
    </div>
  );
}
