"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, MapPin, ArrowRight, Loader2, Check } from "lucide-react";
import { registerAction } from "@/app/actions/auth";
import Logo from "@/components/common/Logo";
import { signIn } from "next-auth/react";

/* ─── PASSWORD STRENGTH ────────────────────────────────────── */

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "bg-red-danger" };
  if (score <= 3) return { score, label: "Fair", color: "bg-amber-gold" };
  return { score, label: "Strong", color: "bg-teal" };
}

/* ─── PAGE COMPONENT ───────────────────────────────────────── */

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const strength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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

    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Enter a valid email address";
    }
    if (!form.password) {
      errs.password = "Password is required";
    } else if (form.password.length < 6) {
      errs.password = "Must be at least 6 characters";
    }
    if (form.password !== form.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("password", form.password);

    try {
      const result = await registerAction(null, formData);
      if (result?.error) {
        setErrors({ root: result.error });
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  }

  const PASSWORD_RULES = [
    { label: "At least 6 characters", met: form.password.length >= 6 },
    { label: "One uppercase letter", met: /[A-Z]/.test(form.password) },
    { label: "One number", met: /[0-9]/.test(form.password) },
  ];

  return (
    <div className="min-h-dvh flex">
      {/* Left — Decorative Panel (desktop only) */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-sand-900 overflow-hidden items-end p-12">
        <div className="absolute top-16 left-10 w-[380px] h-[380px] rounded-full bg-teal/12 blur-[110px]" />
        <div className="absolute bottom-20 right-10 w-[280px] h-[280px] rounded-full bg-amber-gold/15 blur-[100px]" />

        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-2 mb-6">
            <MapPin size={20} className="text-amber-gold" />
            <span className="text-lg font-bold text-white">
              Travel<span className="text-amber-gold">oop</span>
            </span>
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Plan trips that look as good as they feel.
          </h2>
          <p className="text-sand-400 text-sm leading-relaxed">
            Create an account to start building visual itineraries, tracking budgets, and sharing
            your adventures with the world.
          </p>

          {/* Feature checklist */}
          <ul className="mt-8 space-y-3">
            {[
              "Multi-city itinerary builder",
              "Real-time budget tracking",
              "Stunning shareable trip pages",
              "Packing checklists & notes",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-sand-300">
                <span className="w-5 h-5 rounded-full bg-teal/20 flex items-center justify-center shrink-0">
                  <Check size={12} className="text-teal" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right — Signup Form */}
      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Logo />
          </div>

          <h1 className="text-2xl font-bold text-sand-900 mb-1">Create your account</h1>
          <p className="text-sand-500 text-sm mb-8">
            Free forever. No credit card needed.
          </p>

          {errors.root && (
            <div className="mb-6 p-3 bg-red-danger/10 text-red-danger text-sm rounded-lg border border-red-danger/20 text-center font-medium">
              {errors.root}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="signup-name" className="block text-sm font-medium text-sand-700 mb-1.5">
                Full Name
              </label>
              <input
                id="signup-name"
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                className={`input-field ${errors.name ? "error shake" : ""}`}
                placeholder="Enter your full name"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "signup-name-err" : undefined}
              />
              {errors.name && (
                <p id="signup-name-err" className="text-red-danger text-xs mt-1.5" role="alert">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-sand-700 mb-1.5">
                Email
              </label>
              <input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                className={`input-field ${errors.email ? "error shake" : ""}`}
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "signup-email-err" : undefined}
              />
              {errors.email && (
                <p id="signup-email-err" className="text-red-danger text-xs mt-1.5" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-sand-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  className={`input-field pr-11 ${errors.password ? "error shake" : ""}`}
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  aria-describedby="signup-pass-rules"
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
                <p className="text-red-danger text-xs mt-1.5" role="alert">
                  {errors.password}
                </p>
              )}

              {/* Strength indicator */}
              {form.password.length > 0 && (
                <div className="mt-3" id="signup-pass-rules">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i < strength.score ? strength.color : "bg-sand-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-sand-500 font-medium">{strength.label}</span>
                  </div>
                  <ul className="space-y-1">
                    {PASSWORD_RULES.map((rule) => (
                      <li
                        key={rule.label}
                        className={`flex items-center gap-2 text-xs ${
                          rule.met ? "text-teal" : "text-sand-400"
                        }`}
                      >
                        <Check size={12} className={rule.met ? "opacity-100" : "opacity-30"} />
                        {rule.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="signup-confirm" className="block text-sm font-medium text-sand-700 mb-1.5">
                Confirm Password
              </label>
              <input
                id="signup-confirm"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange}
                className={`input-field ${errors.confirmPassword ? "error shake" : ""}`}
                placeholder="••••••••"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? "signup-confirm-err" : undefined}
              />
              {errors.confirmPassword && (
                <p id="signup-confirm-err" className="text-red-danger text-xs mt-1.5" role="alert">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>


          {/* Footer */}
          <p className="text-center text-sm text-sand-500 mt-8">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-amber-gold font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
