"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, MapPin, ArrowRight, Loader2 } from "lucide-react";
import { loginAction } from "@/app/actions/auth";
import { signIn } from "next-auth/react";
import Logo from "@/components/common/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Enter a valid email address";
    }
    if (!form.password) {
      errs.password = "Password is required";
    } else if (form.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    
    const formData = new FormData();
    formData.append("email", form.email);
    formData.append("password", form.password);

    try {
      // loginAction will redirect on success, or return an error object
      const result = await loginAction(null, formData);
      if (result?.error) {
        setErrors({ root: result.error });
        setIsLoading(false);
      }
    } catch (err) {
      // The redirect error from Next.js should propagate
      console.error(err);
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex">
      {/* Left — Decorative Panel (desktop only) */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-sand-900 overflow-hidden items-end p-12">
        {/* Gradient orbs */}
        <div className="absolute top-20 right-16 w-[340px] h-[340px] rounded-full bg-amber-gold/15 blur-[100px]" />
        <div className="absolute bottom-32 left-8 w-[260px] h-[260px] rounded-full bg-teal/12 blur-[90px]" />

        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-2 mb-6">
            <MapPin size={20} className="text-amber-gold" />
            <span className="text-lg font-bold text-white">
              Travel<span className="text-amber-gold">oop</span>
            </span>
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Your next trip starts with a single plan.
          </h2>
          <p className="text-sand-400 text-sm leading-relaxed">
            Join thousands of travelers building stunning itineraries, tracking budgets, and sharing
            trip pages that inspire.
          </p>

          {/* Social proof pill */}
          <div className="mt-8 inline-flex items-center gap-3 bg-white/8 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2.5">
            <div className="flex -space-x-2">
              {["bg-amber-gold", "bg-teal", "bg-coral", "bg-indigo-accent"].map((color, i) => (
                <span
                  key={i}
                  className={`w-7 h-7 rounded-full ${color} border-2 border-sand-900 flex items-center justify-center text-[10px] text-white font-bold`}
                >
                  {String.fromCharCode(65 + i)}
                </span>
              ))}
            </div>
            <span className="text-xs text-sand-300">
              <strong className="text-white">2,400+</strong> trips planned this month
            </span>
          </div>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Logo />
          </div>

          <h1 className="text-2xl font-bold text-sand-900 mb-1">Welcome back</h1>
          <p className="text-sand-500 text-sm mb-8">
            Log in to continue planning your trips.
          </p>

          {errors.root && (
            <div className="mb-6 p-3 bg-red-danger/10 text-red-danger text-sm rounded-lg border border-red-danger/20 text-center font-medium">
              {errors.root}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-sand-700 mb-1.5">
                Email
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                className={`input-field ${errors.email ? "error shake" : ""}`}
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "login-email-err" : undefined}
              />
              {errors.email && (
                <p id="login-email-err" className="text-red-danger text-xs mt-1.5" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="text-sm font-medium text-sand-700">
                  Password
                </label>
                <Link
                  href="#"
                  className="text-xs text-amber-gold hover:underline font-medium"
                  tabIndex={-1}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  className={`input-field pr-11 ${errors.password ? "error shake" : ""}`}
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "login-pass-err" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sand-400 hover:text-sand-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p id="login-pass-err" className="text-red-danger text-xs mt-1.5" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                id="login-remember"
                name="remember"
                type="checkbox"
                checked={form.remember}
                onChange={handleChange}
                className="w-4 h-4 rounded border-sand-300 text-amber-gold focus:ring-amber-gold/30"
              />
              <label htmlFor="login-remember" className="text-sm text-sand-600">
                Remember me
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Logging in…
                </>
              ) : (
                <>
                  Log In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>


          {/* Footer link */}
          <p className="text-center text-sm text-sand-500 mt-8">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-amber-gold font-semibold hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
