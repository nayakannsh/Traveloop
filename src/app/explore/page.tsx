"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { Search, MapPin, CalendarDays, ArrowRight, Globe, Copy, Eye, Compass, Plane, Sparkles } from "lucide-react";
import CityDiscovery from "./CityDiscovery";
import toast from "react-hot-toast";
import Logo from "@/components/common/Logo";

/* ─── MOCK DATA ────────────────────────────────────────────── */

const PUBLIC_TRIPS = [
  { id: "1", slug: "southeast-asia-adventure", title: "Southeast Asia Adventure", author: "Traveloop User", startDate: "2026-06-15", endDate: "2026-06-26", cityCount: 4, cities: ["Bangkok", "Chiang Mai", "Bali", "Singapore"] },
  { id: "2", slug: "japan-spring-2026", title: "Japan Spring 2026", author: "Alex Chen", startDate: "2026-03-20", endDate: "2026-03-30", cityCount: 3, cities: ["Tokyo", "Kyoto", "Osaka"] },
  { id: "3", slug: "euro-summer", title: "European Summer Road Trip", author: "Maria Santos", startDate: "2026-07-01", endDate: "2026-07-21", cityCount: 5, cities: ["Paris", "Barcelona", "Rome", "Vienna", "Prague"] },
  { id: "4", slug: "india-golden-triangle", title: "India Golden Triangle", author: "Ravi Kumar", startDate: "2026-01-10", endDate: "2026-01-17", cityCount: 3, cities: ["Delhi", "Agra", "Jaipur"] },
  { id: "5", slug: "south-america-explorer", title: "South America Explorer", author: "Lina Garcia", startDate: "2026-09-01", endDate: "2026-09-20", cityCount: 4, cities: ["Lima", "Cusco", "Buenos Aires", "Rio"] },
  { id: "6", slug: "maldives-honeymoon", title: "Maldives & Sri Lanka", author: "Tom & Sarah", startDate: "2026-02-14", endDate: "2026-02-24", cityCount: 2, cities: ["Male", "Colombo"] },
];

const COLOR_CYCLE = ["bg-amber-gold", "bg-teal", "bg-coral", "bg-indigo-accent"];

/* ─── PAGE ─────────────────────────────────────────────────── */

export default function ExplorePage() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return PUBLIC_TRIPS;
    const q = search.toLowerCase();
    return PUBLIC_TRIPS.filter(
      (t) => t.title.toLowerCase().includes(q) || t.cities.some((c) => c.toLowerCase().includes(q)) || t.author.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="min-h-dvh bg-sand-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-sand-50/80 backdrop-blur-md border-b border-sand-200/60">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-5 py-3.5">
          <Logo />
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-sand-500 hover:text-sand-700 font-medium transition-colors">Dashboard</Link>
            <Link href="/auth/signup" className="btn-primary text-sm py-2 px-4">Get Started</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal/10 text-teal text-xs font-semibold uppercase tracking-wide mb-4">
            <Globe size={13} /> Community Trips
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-sand-900 mb-3">Explore public itineraries</h1>
          <p className="text-sand-500 text-base max-w-lg mx-auto">Browse travel plans shared by the community. Get inspired, copy a trip, and make it your own.</p>
        </div>

        <CityDiscovery />

        <div className="h-px bg-sand-200 my-16" />

        {/* Search */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-sand-900 mb-2">Community Itineraries</h2>
          <p className="text-sand-500 text-sm">Browse plans shared by other travelers</p>
        </div>

        <div className="relative max-w-md mx-auto mb-10">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-400" />
          <input type="text" placeholder="Search by destination, title, or author…" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10 text-sm" aria-label="Search public trips" />
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Globe size={40} className="text-sand-300 mx-auto mb-3" />
            <p className="text-sm text-sand-500">No trips match your search.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((trip, idx) => (
              <div key={trip.id} className="card overflow-hidden group">
                {/* Color header bar */}
                <div className={`h-2 ${COLOR_CYCLE[idx % COLOR_CYCLE.length]}`} />

                <div className="p-5">
                  <Link href={`/p/${trip.slug}`} className="text-base font-semibold text-sand-900 group-hover:text-amber-gold transition-colors block mb-1">
                    {trip.title}
                  </Link>
                  <p className="text-xs text-sand-400 mb-3">by {trip.author}</p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {trip.cities.map((city) => (
                      <span key={city} className="text-xs px-2 py-0.5 rounded-full bg-sand-100 text-sand-600">{city}</span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-sand-400 mb-4">
                    <span className="flex items-center gap-1"><CalendarDays size={12} /> {dayjs(trip.startDate).format("MMM D")} – {dayjs(trip.endDate).format("MMM D")}</span>
                    <span className="flex items-center gap-1"><MapPin size={12} /> {trip.cityCount} cities</span>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/p/${trip.slug}`} className="btn-secondary text-xs py-1.5 px-3 flex-1 justify-center"><Eye size={12} /> View</Link>
                    <button 
                      onClick={() => toast.success(`"${trip.title}" copied to your trips!`)}
                      className="btn-secondary text-xs py-1.5 px-3 flex-1 justify-center"
                    >
                      <Copy size={12} /> Copy Trip
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
