import Link from "next/link";
import dayjs from "dayjs";
import { auth } from "@/auth";
import {
  Plus,
  MapPin,
  CalendarDays,
  Wallet,
  TrendingUp,
  ArrowRight,
  Compass,
  CheckSquare,
  StickyNote,
  Globe,
  Plane,
  Star,
} from "lucide-react";
import UserMenu from "@/components/layout/UserMenu";
import Logo from "@/components/common/Logo";
import { prisma } from "@/lib/prisma";

/* ─── STATIC DATA ─────────────────────────────────────────── */

const POPULAR_CITIES = [
  { name: "Bali", country: "Indonesia", trips: 1240 },
  { name: "Tokyo", country: "Japan", trips: 980 },
  { name: "Paris", country: "France", trips: 870 },
  { name: "Bangkok", country: "Thailand", trips: 760 },
];

/* ─── PAGE ─────────────────────────────────────────────────── */

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user?.id) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true }
  });

  const userName = dbUser?.name || session.user.name || "Traveler";
  const greeting = getGreeting();

  const now = new Date();

  // Fetch real trips from DB
  const trips = await prisma.trip.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { stops: true } }
    },
    orderBy: { startDate: "asc" },
  });

  const upcomingTrips = trips.filter(t => t.endDate >= now && t.status !== "COMPLETED");
  const recentTrips = trips.filter(t => t.endDate < now || t.status === "COMPLETED");

  // Calculate real stats
  const totalStops = trips.reduce((acc, t) => acc + t._count.stops, 0);
  const tripIds = trips.map(t => t.id);
  const budgets = await prisma.budget.findMany({
    where: { tripId: { in: tripIds } }
  });
  const totalSpent = budgets.reduce((acc, b) => acc + b.amountActual, 0);
  const activitiesCount = await prisma.tripActivity.count({
    where: { tripStop: { trip: { userId: session.user.id } } }
  });

  const stats = { 
    totalTrips: trips.length, 
    citiesVisited: totalStops, 
    totalSpent,
    activitiesDone: activitiesCount
  };

  return (
    <div className="min-h-dvh bg-cream-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-cream-50/80 backdrop-blur-xl border-b border-cream-200/60">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-3.5">
          <Logo />
          <div className="flex items-center gap-5">
            <Link href="/explore" className="text-sm text-cream-500 hover:text-emerald font-medium transition-colors hidden sm:block">Explore</Link>
            <UserMenu user={{ ...session.user, name: userName } as any} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 space-y-10">
        {/* Welcome Banner */}
        <div className="relative bg-emerald rounded-[2rem] p-8 md:p-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-[80px] -mr-40 -mt-40" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-gold/10 rounded-full blur-[60px] -ml-20 -mb-20" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <p className="text-emerald-muted text-sm font-semibold mb-1">{greeting}</p>
              <h1 className="text-3xl md:text-4xl font-serif text-white leading-tight">
                {userName.split(' ')[0]}, <span className="italic">welcome back</span>.
              </h1>
              <p className="text-white/60 text-sm mt-2">Here&apos;s your travel overview.</p>
            </div>
            <Link href="/trips/new" className="bg-white text-emerald-dark font-bold py-3 px-8 rounded-full text-sm hover:bg-cream-100 hover:shadow-lg transition-all self-start inline-flex items-center gap-2">
              <Plus size={16} /> New Trip
            </Link>
          </div>
        </div>

        {/* Stats — Floating Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: "Total Trips", value: stats.totalTrips, icon: CalendarDays, accent: "bg-emerald/10 text-emerald" },
            { label: "Cities Visited", value: stats.citiesVisited, icon: MapPin, accent: "bg-teal/10 text-teal" },
            { label: "Total Spent", value: `$${stats.totalSpent.toLocaleString()}`, icon: Wallet, accent: "bg-gold/10 text-gold" },
            { label: "Activities", value: stats.activitiesDone, icon: TrendingUp, accent: "bg-coral/10 text-coral" },
          ].map((s) => (
            <div key={s.label} className="card-float p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl ${s.accent} flex items-center justify-center shrink-0`}>
                <s.icon size={20} />
              </div>
              <div className="relative z-10">
                <p className="text-[11px] text-cream-400 font-bold uppercase tracking-wider">{s.label}</p>
                <p className="text-xl font-bold text-cream-900 mt-0.5">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Upcoming Trips */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-cream-900">Upcoming Trips</h2>
                <Link href="/trips" className="text-xs text-emerald font-bold hover:underline flex items-center gap-1">View all <ArrowRight size={12} /></Link>
              </div>
              {upcomingTrips.length === 0 ? (
                <div className="card p-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-cream-100 flex items-center justify-center mx-auto mb-4">
                    <Compass size={28} className="text-cream-300" />
                  </div>
                  <p className="text-sm text-cream-500 mb-4">No upcoming trips. Plan your next adventure!</p>
                  <Link href="/trips/new" className="btn-primary text-sm inline-flex"><Plus size={14} /> Create Trip</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingTrips.map((trip) => (
                    <Link key={trip.id} href={`/trips/${trip.id}/builder`} className="card p-5 flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald/15 to-teal/10 flex items-center justify-center text-emerald shrink-0 group-hover:scale-105 transition-transform">
                        <Plane size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-cream-900 group-hover:text-emerald transition-colors truncate">{trip.title}</p>
                        <p className="text-xs text-cream-400 mt-0.5">{dayjs(trip.startDate).format("MMM D")} – {dayjs(trip.endDate).format("MMM D")} · {trip._count.stops} cities</p>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${trip.status === "PLANNED" ? "bg-emerald/10 text-emerald" : "bg-cream-200 text-cream-600"}`}>
                        {trip.status === "PLANNED" ? "Planned" : "Draft"}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Recently Completed */}
            {recentTrips.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-cream-900 mb-5">Recently Completed</h2>
                <div className="space-y-3">
                  {recentTrips.map((trip) => (
                    <Link key={trip.id} href={`/trips/${trip.id}/builder`} className="card p-5 flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold shrink-0">
                        <CheckSquare size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-cream-900 group-hover:text-emerald transition-colors truncate">{trip.title}</p>
                        <p className="text-xs text-cream-400 mt-0.5">{dayjs(trip.startDate).format("MMM D")} – {dayjs(trip.endDate).format("MMM D")} · {trip._count.stops} cities</p>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-gold/10 text-gold">Completed</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Sidebar */}
          <aside className="space-y-6">
            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="text-sm font-bold text-cream-900 mb-4 uppercase tracking-wider text-[11px]">Quick Actions</h3>
              <div className="space-y-1">
                {[
                  { label: "My Trips", href: "/trips", icon: CalendarDays },
                  { label: "Budget Overview", href: "/budget", icon: Wallet },
                  { label: "Packing Lists", href: trips[0] ? `/trips/${trips[0].id}/packing` : "/trips", icon: CheckSquare },
                  { label: "Trip Notes", href: trips[0] ? `/trips/${trips[0].id}/notes` : "/trips", icon: StickyNote },
                  { label: "Explore Public Trips", href: "/explore", icon: Globe },
                ].map((a) => (
                  <Link key={a.label} href={a.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-cream-100 text-sm text-cream-700 font-medium transition-colors group">
                    <a.icon size={16} className="text-cream-400 group-hover:text-emerald transition-colors" />
                    {a.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Trending Destinations */}
            <div className="card p-6">
              <h3 className="text-sm font-bold text-cream-900 mb-4 uppercase tracking-wider text-[11px]">Trending Destinations</h3>
              <div className="space-y-3">
                {POPULAR_CITIES.map((city, i) => (
                  <div key={city.name} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald/10 flex items-center justify-center text-emerald shrink-0">
                      <MapPin size={14} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-cream-800">{city.name}</p>
                      <p className="text-xs text-cream-400">{city.country}</p>
                    </div>
                    <span className="text-[10px] text-cream-400 font-mono font-bold">{city.trips}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Inspirational Card */}
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
              <img 
                src="/traveldestination.jpeg" 
                alt="Travel inspiration" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cream-900/80 via-cream-900/20 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider">Inspiration</p>
                <p className="text-white font-serif text-lg mt-1">Discover your next destination</p>
                <Link href="/explore" className="text-emerald-muted text-xs font-bold mt-2 inline-flex items-center gap-1 hover:text-white transition-colors">
                  Explore now <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
