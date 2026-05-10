"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Utensils,
  Mountain,
  Landmark,
  ShoppingBag,
  Music,
  TreePine,
  Globe,
  Pencil,
  Share2,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { use } from "react";

/* ─── TYPES ────────────────────────────────────────────────── */

const CAT_ICONS: Record<string, React.ElementType> = { 
  FOOD: Utensils, ADVENTURE: Mountain, HISTORICAL: Landmark, 
  SHOPPING: ShoppingBag, NIGHTLIFE: Music, NATURE: TreePine 
};
const CAT_COLORS: Record<string, string> = { 
  FOOD: "bg-amber-gold/10 text-amber-gold", ADVENTURE: "bg-coral/10 text-coral", 
  HISTORICAL: "bg-indigo-accent/10 text-indigo-accent", SHOPPING: "bg-teal/10 text-teal", 
  NIGHTLIFE: "bg-coral/10 text-coral", NATURE: "bg-teal/10 text-teal" 
};

interface TripActivity {
  id: string;
  title: string;
  scheduledTime: string;
  customCost: number | null;
  scheduledDate: string;
  activity?: {
    category: string;
    duration: number;
  } | null;
}

interface TripStop {
  id: string;
  arrivalDate: string;
  departureDate: string;
  position: number;
  city: {
    name: string;
    country: string;
  };
  activities: TripActivity[];
}

interface TripData {
  id: string;
  title: string;
  stops: TripStop[];
}

/* ─── PAGE ─────────────────────────────────────────────────── */

export default function ItineraryViewPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params);
  const [trip, setTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrip() {
      try {
        const res = await fetch(`/api/trips/${tripId}/itinerary`);
        if (res.ok) {
          const data = await res.json();
          setTrip(data);
        } else {
          toast.error("Failed to load itinerary");
        }
      } catch {
        toast.error("Failed to load itinerary");
      } finally {
        setLoading(false);
      }
    }
    fetchTrip();
  }, [tripId]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Itinerary link copied to clipboard!");
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      toast.success("Itinerary link copied!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-sand-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-amber-gold" />
      </div>
    );
  }

  if (!trip || trip.stops.length === 0) {
    return (
      <div className="min-h-dvh bg-sand-50">
        <header className="sticky top-0 z-40 bg-sand-50/80 backdrop-blur-md border-b border-sand-200/60">
          <div className="mx-auto max-w-4xl flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <Link href={`/trips/${tripId}/builder`} className="p-2 -ml-2 rounded-lg hover:bg-sand-100 text-sand-600" aria-label="Back"><ArrowLeft size={20} /></Link>
              <h1 className="text-lg font-semibold text-sand-900">Itinerary View</h1>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-5 py-20 text-center">
          <MapPin size={48} className="text-sand-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-sand-700 mb-2">No Itinerary Yet</h2>
          <p className="text-sand-400 mb-6">Add cities and activities in the builder first.</p>
          <Link href={`/trips/${tripId}/builder`} className="btn-primary py-2 px-6 text-sm">Go to Builder</Link>
        </main>
      </div>
    );
  }

  // Build day blocks from stop data
  const stops = trip.stops.sort((a, b) => a.position - b.position);
  const totalCost = stops.reduce((s, stop) => 
    s + stop.activities.reduce((a, act) => a + (act.customCost || 0), 0), 0
  );

  let dayCounter = 0;

  return (
    <div className="min-h-dvh bg-sand-50">
      <header className="sticky top-0 z-40 bg-sand-50/80 backdrop-blur-md border-b border-sand-200/60">
        <div className="mx-auto max-w-4xl flex items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            <Link href={`/trips/${tripId}/builder`} className="p-2 -ml-2 rounded-lg hover:bg-sand-100 text-sand-600" aria-label="Back"><ArrowLeft size={20} /></Link>
            <div>
              <h1 className="text-lg font-semibold text-sand-900">Itinerary View</h1>
              <p className="text-xs text-sand-400">{stops.length} {stops.length === 1 ? 'city' : 'cities'} · ${totalCost} total</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/trips/${tripId}/builder`} className="btn-secondary text-xs py-2 px-3"><Pencil size={13} /> Edit</Link>
            <button onClick={handleShare} className="btn-primary text-xs py-2 px-3"><Share2 size={13} /> Share</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-8">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-sand-200 hidden sm:block" />

          {stops.map((stop, stopIdx) => {
            // Calculate days for this stop
            const arrival = dayjs(stop.arrivalDate);
            const departure = dayjs(stop.departureDate);
            const numDays = Math.max(departure.diff(arrival, "day"), 1);

            // Group activities by day
            const dayBlocks: { date: string; activities: TripActivity[] }[] = [];
            for (let d = 0; d < numDays; d++) {
              const thisDate = arrival.add(d, "day").format("YYYY-MM-DD");
              // For activities without proper scheduled dates, distribute evenly
              // or put all on first day
              const dayActivities = stop.activities.filter((act) => {
                const actDate = dayjs(act.scheduledDate).format("YYYY-MM-DD");
                return actDate === thisDate;
              });
              dayBlocks.push({ date: thisDate, activities: dayActivities });
            }

            // If no activities matched any day (all on same date placeholder), put all on day 1
            const totalDistributed = dayBlocks.reduce((s, db) => s + db.activities.length, 0);
            if (totalDistributed === 0 && stop.activities.length > 0) {
              dayBlocks[0].activities = [...stop.activities];
            }

            return (
              <div key={stop.id} className="mb-10 last:mb-0">
                {/* City Header */}
                <div className="relative flex items-center gap-4 mb-5 sm:pl-14">
                  <div className="hidden sm:flex absolute left-0 w-10 h-10 rounded-full bg-amber-gold text-white items-center justify-center text-sm font-bold z-10">
                    {stopIdx + 1}
                  </div>
                  <div className="sm:hidden w-8 h-8 rounded-full bg-amber-gold text-white flex items-center justify-center text-xs font-bold shrink-0">{stopIdx + 1}</div>
                  <div>
                    <h2 className="text-xl font-bold text-sand-900">{stop.city.name}</h2>
                    <p className="text-xs text-sand-400">{stop.city.country} · {arrival.format("MMM D")} – {departure.format("MMM D")}</p>
                  </div>
                </div>

                {/* Days */}
                {dayBlocks.map((day) => {
                  dayCounter++;
                  const dayCost = day.activities.reduce((s, a) => s + (a.customCost || 0), 0);
                  return (
                    <div key={day.date} className="sm:pl-14 mb-6 last:mb-0">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-semibold text-sand-500 uppercase tracking-wider">Day {dayCounter}</span>
                        <span className="text-xs text-sand-400">{dayjs(day.date).format("ddd, MMM D")}</span>
                        <span className="ml-auto text-xs font-mono text-sand-400">${dayCost}</span>
                      </div>

                      {day.activities.length === 0 ? (
                        <div className="p-3 rounded-lg bg-sand-50 border border-sand-100 text-center">
                          <p className="text-xs text-sand-400 italic">No activities planned</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {day.activities.map((act) => {
                            const category = act.activity?.category || "FOOD";
                            const CatIcon = CAT_ICONS[category] || Globe;
                            const catColor = CAT_COLORS[category] || "bg-sand-100 text-sand-500";
                            const duration = act.activity?.duration || 60;
                            return (
                              <div key={act.id} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-sand-100">
                                <div className={`w-9 h-9 rounded-lg ${catColor} flex items-center justify-center shrink-0`}>
                                  <CatIcon size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-sand-800">{act.title}</p>
                                  <p className="text-xs text-sand-400 flex items-center gap-2 mt-0.5">
                                    <Clock size={10} /> {act.scheduledTime} · {duration} min
                                  </p>
                                </div>
                                <span className="text-xs font-mono text-sand-500">${act.customCost || 0}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* City transition marker */}
                {stopIdx < stops.length - 1 && (
                  <div className="sm:pl-14 flex items-center gap-2 py-2 text-xs text-sand-400">
                    <div className="flex-1 h-px bg-sand-200" />
                    <MapPin size={12} /> Travel to next city
                    <div className="flex-1 h-px bg-sand-200" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
