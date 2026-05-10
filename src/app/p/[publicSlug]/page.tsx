import type { Metadata } from "next";
import Link from "next/link";
import dayjs from "dayjs";
import {
  MapPin,
  CalendarDays,
  Clock,
  DollarSign,
  Utensils,
  Mountain,
  Landmark,
  ShoppingBag,
  TreePine,
  Globe,
  Copy,
  Share2,
  ArrowRight,
} from "lucide-react";

/* ─── SEO METADATA ─────────────────────────────────────────── */

export const metadata: Metadata = {
  title: "Southeast Asia Adventure — Traveloop",
  description: "12-day trip across Bangkok, Chiang Mai, Bali, and Singapore. View the full itinerary with activities, budget, and more.",
  openGraph: {
    title: "Southeast Asia Adventure — Traveloop",
    description: "A stunning 12-day multi-city trip planned on Traveloop.",
    type: "article",
  },
};

/* ─── MOCK DATA ────────────────────────────────────────────── */

const TRIP = {
  title: "Southeast Asia Adventure",
  description: "A 12-day journey through temples, street food, rice terraces, and skylines across 4 incredible cities.",
  startDate: "2026-06-15",
  endDate: "2026-06-26",
  author: "Traveloop User",
  cityCount: 4,
  totalCost: 2140,
};

const STOPS = [
  {
    city: "Bangkok", country: "Thailand", days: "Day 1–3",
    activities: [
      { title: "Grand Palace Visit", category: "HISTORICAL", cost: 15 },
      { title: "Street Food Tour", category: "FOOD", cost: 25 },
      { title: "Floating Market", category: "SHOPPING", cost: 20 },
    ],
  },
  {
    city: "Chiang Mai", country: "Thailand", days: "Day 4–6",
    activities: [
      { title: "Doi Suthep Temple", category: "HISTORICAL", cost: 5 },
      { title: "Thai Cooking Class", category: "FOOD", cost: 30 },
      { title: "Elephant Sanctuary", category: "NATURE", cost: 60 },
    ],
  },
  {
    city: "Bali", country: "Indonesia", days: "Day 7–9",
    activities: [
      { title: "Ubud Rice Terraces", category: "NATURE", cost: 10 },
      { title: "Sunset at Tanah Lot", category: "NATURE", cost: 8 },
    ],
  },
  {
    city: "Singapore", country: "Singapore", days: "Day 10–12",
    activities: [
      { title: "Marina Bay Walk", category: "SHOPPING", cost: 0 },
      { title: "Hawker Center Dinner", category: "FOOD", cost: 12 },
    ],
  },
];

const CAT_ICONS: Record<string, React.ElementType> = { FOOD: Utensils, ADVENTURE: Mountain, HISTORICAL: Landmark, SHOPPING: ShoppingBag, NATURE: TreePine };
const CAT_COLORS: Record<string, string> = { FOOD: "bg-amber-gold/10 text-amber-gold", HISTORICAL: "bg-indigo-accent/10 text-indigo-accent", SHOPPING: "bg-teal/10 text-teal", NATURE: "bg-teal/10 text-teal", ADVENTURE: "bg-coral/10 text-coral" };
const STOP_COLORS = ["bg-amber-gold", "bg-teal", "bg-coral", "bg-indigo-accent"];

/* ─── PAGE (Server Component — no auth required) ───────────── */

export default async function PublicTripPage({ params }: { params: Promise<{ publicSlug: string }> }) {
  const { publicSlug } = await params;

  return (
    <div className="min-h-dvh bg-sand-50">
      {/* Minimal header */}
      <header className="border-b border-sand-200/60 py-4 px-5">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <MapPin size={16} className="text-amber-gold" />
            <span className="font-bold text-sand-900">Travel<span className="text-amber-gold">oop</span></span>
          </Link>
          <Link href="/auth/signup" className="btn-primary text-xs py-2 px-4">
            Plan Your Own Trip <ArrowRight size={12} />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-10">
        {/* Hero */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Globe size={14} className="text-teal" />
            <span className="text-xs font-semibold text-teal uppercase tracking-wider">Public Trip</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-sand-900 mb-3">{TRIP.title}</h1>
          <p className="text-sand-500 text-base leading-relaxed max-w-2xl mb-5">{TRIP.description}</p>

          <div className="flex flex-wrap gap-4 text-sm text-sand-500">
            <span className="flex items-center gap-1.5"><CalendarDays size={14} /> {dayjs(TRIP.startDate).format("MMM D")} – {dayjs(TRIP.endDate).format("MMM D, YYYY")}</span>
            <span className="flex items-center gap-1.5"><MapPin size={14} /> {TRIP.cityCount} cities</span>
            <span className="flex items-center gap-1.5 font-mono"><DollarSign size={14} /> ${TRIP.totalCost}</span>
            <span className="text-sand-400">by {TRIP.author}</span>
          </div>

          {/* Share buttons */}
          <div className="flex gap-2 mt-6">
            <button className="btn-secondary text-xs py-2 px-4"><Copy size={13} /> Copy Link</button>
            <button className="btn-secondary text-xs py-2 px-4"><Share2 size={13} /> Share</button>
          </div>
        </div>

        {/* City Stops */}
        <div className="space-y-8">
          {STOPS.map((stop, idx) => (
            <section key={stop.city} className="card overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-sand-100">
                <div className={`w-8 h-8 rounded-full ${STOP_COLORS[idx % STOP_COLORS.length]} text-white flex items-center justify-center text-xs font-bold`}>
                  {idx + 1}
                </div>
                <div>
                  <h2 className="font-semibold text-sand-900">{stop.city}</h2>
                  <p className="text-xs text-sand-400">{stop.country} · {stop.days}</p>
                </div>
              </div>
              <div className="p-5 space-y-2">
                {stop.activities.map((act, i) => {
                  const CatIcon = CAT_ICONS[act.category] || Globe;
                  const catColor = CAT_COLORS[act.category] || "bg-sand-100 text-sand-500";
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-sand-50">
                      <div className={`w-8 h-8 rounded-lg ${catColor} flex items-center justify-center shrink-0`}>
                        <CatIcon size={14} />
                      </div>
                      <span className="flex-1 text-sm font-medium text-sand-800">{act.title}</span>
                      <span className="text-xs font-mono text-sand-400">${act.cost}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* CTA Footer */}
        <div className="text-center mt-16 py-12 border-t border-sand-200">
          <p className="text-lg font-semibold text-sand-900 mb-2">Inspired by this trip?</p>
          <p className="text-sm text-sand-500 mb-6">Create your own itinerary on Traveloop — it&apos;s free.</p>
          <Link href="/auth/signup" className="btn-primary">Start Planning <ArrowRight size={16} /></Link>
        </div>
      </main>
    </div>
  );
}
