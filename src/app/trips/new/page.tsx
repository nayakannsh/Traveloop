"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dayjs from "dayjs";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  ImagePlus,
  Lock,
  Globe,
  Link2,
  Loader2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { createTripAction } from "@/app/actions/trip";

type Privacy = "PRIVATE" | "PUBLIC" | "UNLISTED";

const PRIVACY_OPTIONS: { value: Privacy; label: string; desc: string; icon: React.ElementType }[] = [
  { value: "PRIVATE", label: "Private", desc: "Only you can see this trip", icon: Lock },
  { value: "PUBLIC", label: "Public", desc: "Anyone can discover and view", icon: Globe },
  { value: "UNLISTED", label: "Unlisted", desc: "Only people with the link", icon: Link2 },
];

export default function CreateTripPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    privacy: "PRIVATE" as Privacy,
    coverImage: null as File | null,
  });

  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const duration = form.startDate && form.endDate
    ? dayjs(form.endDate).diff(dayjs(form.startDate), "day") + 1
    : 0;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Trip name is required";
    if (!form.startDate) errs.startDate = "Start date is required";
    if (!form.endDate) errs.endDate = "End date is required";
    if (form.startDate && form.endDate && dayjs(form.endDate).isBefore(dayjs(form.startDate))) {
      errs.endDate = "End date must be on or after start date";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append("title", form.title);
    if (form.description) formData.append("description", form.description);
    formData.append("startDate", form.startDate);
    formData.append("endDate", form.endDate);
    formData.append("privacy", form.privacy);
    // Note: Local cover image upload will be wired up in part 4.4
    
    try {
      const result = await createTripAction(null, formData);
      if (result?.error) {
        setErrors({ root: result.error });
        setIsLoading(false);
      }
    } catch (err) {
      // Catch Next.js redirect
      console.error(err);
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-sand-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-sand-50/80 backdrop-blur-md border-b border-sand-200/60">
        <div className="mx-auto max-w-3xl flex items-center gap-4 px-5 py-3.5">
          <Link
            href="/trips"
            className="p-2 -ml-2 rounded-lg hover:bg-sand-100 transition-colors text-sand-600"
            aria-label="Back to trips"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-semibold text-sand-900">Create New Trip</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-8">
        {errors.root && (
          <div className="mb-6 p-4 bg-red-danger/10 border border-red-danger/20 rounded-xl text-red-danger text-sm font-medium">
            {errors.root}
          </div>
        )}
        <form onSubmit={handleSubmit} noValidate className="space-y-8">
          {/* Trip Name */}
          <div>
            <label htmlFor="trip-title" className="block text-sm font-medium text-sand-700 mb-1.5">
              Trip Name <span className="text-red-danger">*</span>
            </label>
            <input
              id="trip-title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              className={`input-field ${errors.title ? "error shake" : ""}`}
              placeholder="e.g., Southeast Asia Adventure"
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="text-red-danger text-xs mt-1.5" role="alert">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="trip-desc" className="block text-sm font-medium text-sand-700 mb-1.5">
              Description <span className="text-sand-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="trip-desc"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="input-field resize-none"
              placeholder="A short description of your trip…"
            />
          </div>

          {/* Dates */}
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="trip-start" className="block text-sm font-medium text-sand-700 mb-1.5">
                <CalendarDays size={14} className="inline mr-1.5 -mt-0.5" />
                Start Date <span className="text-red-danger">*</span>
              </label>
              <input
                id="trip-start"
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
                className={`input-field ${errors.startDate ? "error shake" : ""}`}
                aria-invalid={!!errors.startDate}
              />
              {errors.startDate && (
                <p className="text-red-danger text-xs mt-1.5" role="alert">{errors.startDate}</p>
              )}
            </div>
            <div>
              <label htmlFor="trip-end" className="block text-sm font-medium text-sand-700 mb-1.5">
                <CalendarDays size={14} className="inline mr-1.5 -mt-0.5" />
                End Date <span className="text-red-danger">*</span>
              </label>
              <input
                id="trip-end"
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={handleChange}
                min={form.startDate || undefined}
                className={`input-field ${errors.endDate ? "error shake" : ""}`}
                aria-invalid={!!errors.endDate}
              />
              {errors.endDate && (
                <p className="text-red-danger text-xs mt-1.5" role="alert">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Duration Badge */}
          {duration > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal/10 text-teal text-sm font-medium animate-fade-in-up">
              <Sparkles size={14} />
              {duration} {duration === 1 ? "day" : "days"}, {Math.max(0, duration - 1)} {duration - 1 === 1 ? "night" : "nights"}
            </div>
          )}

          {/* Privacy */}
          <div>
            <p className="text-sm font-medium text-sand-700 mb-3">Privacy</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {PRIVACY_OPTIONS.map((opt) => {
                const isActive = form.privacy === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, privacy: opt.value }))}
                    className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                      isActive
                        ? "border-amber-gold bg-amber-gold/5 ring-1 ring-amber-gold/30"
                        : "border-sand-200 hover:border-sand-300"
                    }`}
                    aria-pressed={isActive}
                  >
                    <opt.icon
                      size={18}
                      className={isActive ? "text-amber-gold mt-0.5" : "text-sand-400 mt-0.5"}
                    />
                    <div>
                      <span className={`text-sm font-semibold ${isActive ? "text-sand-900" : "text-sand-700"}`}>
                        {opt.label}
                      </span>
                      <span className="block text-xs text-sand-400 mt-0.5">{opt.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-sand-100">
            <Link href="/trips" className="btn-secondary text-sm py-2.5 px-5">
              Cancel
            </Link>
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? (
                <><Loader2 size={18} className="animate-spin" /> Creating…</>
              ) : (
                <>Create Trip <ArrowRight size={16} /></>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
