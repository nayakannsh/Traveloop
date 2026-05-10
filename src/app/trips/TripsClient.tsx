"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Calendar,
  MapPin,
  Wallet,
  Globe,
  Lock,
  Link2,
  MoreVertical,
  Pencil,
  Trash2,
  Share2,
  Eye,
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Plane,
} from "lucide-react";
import toast from "react-hot-toast";
import { updateTripStatusAction, deleteTripAction } from "@/app/actions/trip";
import { useRouter } from "next/navigation";

/* ─── TYPES ────────────────────────────────────────────────── */

type TripStatus = "DRAFT" | "PLANNED" | "ONGOING" | "COMPLETED" | "CANCELLED";
type TripPrivacy = "PRIVATE" | "PUBLIC" | "UNLISTED";

interface Trip {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  coverImage: string | null;
  privacy: TripPrivacy;
  status: TripStatus;
  cityCount: number;
  budgetUsed: number;
  budgetLimit: number;
}

/* ─── HELPERS ──────────────────────────────────────────────── */

const STATUS_STYLES: Record<TripStatus, { bg: string; text: string; label: string; icon: React.ElementType }> = {
  DRAFT: { bg: "bg-sand-200/60", text: "text-sand-600", label: "Draft", icon: Pencil },
  PLANNED: { bg: "bg-teal/10", text: "text-teal", label: "Planned", icon: Calendar },
  ONGOING: { bg: "bg-amber-gold/10", text: "text-amber-gold", label: "Ongoing", icon: Plane },
  COMPLETED: { bg: "bg-emerald/10", text: "text-emerald", label: "Completed", icon: CheckCircle2 },
  CANCELLED: { bg: "bg-red-danger/10", text: "text-red-danger", label: "Cancelled", icon: XCircle },
};

const STATUS_ORDER: TripStatus[] = ["DRAFT", "PLANNED", "ONGOING", "COMPLETED", "CANCELLED"];

const PRIVACY_ICONS: Record<TripPrivacy, React.ElementType> = {
  PRIVATE: Lock,
  PUBLIC: Globe,
  UNLISTED: Link2,
};

type FilterTab = "ALL" | TripStatus;

/* ─── PAGE COMPONENT ───────────────────────────────────────── */

export default function TripsClient({ initialTrips }: { initialTrips: Trip[] }) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const router = useRouter();

  const filtered = useMemo(() => {
    let result = trips;
    if (activeFilter !== "ALL") {
      result = result.filter((t) => t.status === activeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [search, activeFilter, trips]);

  const FILTERS: { key: FilterTab; label: string; count: number }[] = [
    { key: "ALL", label: "All", count: trips.length },
    { key: "PLANNED", label: "Upcoming", count: trips.filter(t => t.status === "PLANNED").length },
    { key: "ONGOING", label: "Ongoing", count: trips.filter(t => t.status === "ONGOING").length },
    { key: "DRAFT", label: "Draft", count: trips.filter(t => t.status === "DRAFT").length },
    { key: "COMPLETED", label: "Completed", count: trips.filter(t => t.status === "COMPLETED").length },
    { key: "CANCELLED", label: "Cancelled", count: trips.filter(t => t.status === "CANCELLED").length },
  ];

  async function handleStatusChange(tripId: string, newStatus: TripStatus) {
    setOpenMenuId(null);
    const result = await updateTripStatusAction(tripId, newStatus);
    if (result.success) {
      setTrips(prev => prev.map(t => t.id === tripId ? { ...t, status: newStatus } : t));
      toast.success(`Status changed to ${STATUS_STYLES[newStatus].label}`);
    } else {
      toast.error(result.error || "Failed to update status");
    }
  }

  async function handleDelete(tripId: string, title: string) {
    setOpenMenuId(null);
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const result = await deleteTripAction(tripId);
    if (result.success) {
      setTrips(prev => prev.filter(t => t.id !== tripId));
      toast.success("Trip deleted");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to delete trip");
    }
  }

  function handleShare(tripId: string) {
    setOpenMenuId(null);
    navigator.clipboard.writeText(`${window.location.origin}/trips/${tripId}/itinerary`);
    toast.success("Trip link copied to clipboard!");
  }

  return (
    <div className="min-h-dvh bg-sand-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-sand-50/80 backdrop-blur-md border-b border-sand-200/60">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 -ml-2 rounded-lg hover:bg-sand-100 transition-colors text-sand-600"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-lg font-semibold text-sand-900">My Trips</h1>
          </div>
          <Link href="/trips/new" className="btn-primary text-sm py-2 px-4">
            <Plus size={16} /> New Trip
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-6 space-y-6">
        {/* Search + View Toggle */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-400" />
            <input
              type="text"
              placeholder="Search trips…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 text-sm"
              aria-label="Search trips"
            />
          </div>
          <div className="flex items-center gap-1 bg-sand-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-white shadow-sm text-sand-900" : "text-sand-400 hover:text-sand-600"}`}
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-white shadow-sm text-sand-900" : "text-sand-400 hover:text-sand-600"}`}
              aria-label="List view"
              aria-pressed={viewMode === "list"}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
          {FILTERS.filter(f => f.key === "ALL" || f.count > 0).map((f) => (
            <button
              key={f.key}
              role="tab"
              aria-selected={activeFilter === f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeFilter === f.key
                  ? "bg-sand-900 text-white"
                  : "bg-sand-100 text-sand-500 hover:text-sand-700"
              }`}
            >
              {f.label}
              {f.count > 0 && <span className={`text-[10px] font-bold ${activeFilter === f.key ? "text-white/60" : "text-sand-400"}`}>{f.count}</span>}
            </button>
          ))}
        </div>

        {/* Trip Cards */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <MapPin size={40} className="text-sand-300 mb-4" />
            <p className="text-lg font-semibold text-sand-700 mb-1">No trips found</p>
            <p className="text-sm text-sand-400 mb-6">
              {search ? "Try adjusting your search." : "Start your first adventure!"}
            </p>
            <Link href="/trips/new" className="btn-primary text-sm">
              <Plus size={16} /> Create Trip
            </Link>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((trip, idx) => (
              <TripCard
                key={trip.id}
                trip={trip}
                index={idx}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                onShare={handleShare}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((trip, idx) => (
              <TripListRow
                key={trip.id}
                trip={trip}
                index={idx}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                onShare={handleShare}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/* ─── TRIP CARD (GRID) ─────────────────────────────────────── */

interface TripCardProps {
  trip: Trip;
  index: number;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  onStatusChange: (id: string, status: TripStatus) => void;
  onDelete: (id: string, title: string) => void;
  onShare: (id: string) => void;
}

function TripCard({ trip, index, openMenuId, setOpenMenuId, onStatusChange, onDelete, onShare }: TripCardProps) {
  const status = STATUS_STYLES[trip.status];
  const StatusIcon = status.icon;
  const PrivacyIcon = PRIVACY_ICONS[trip.privacy];
  const budgetPercent = trip.budgetLimit > 0 ? Math.round((trip.budgetUsed / trip.budgetLimit) * 100) : 0;
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  return (
    <div className={`card group relative transition-all ${openMenuId === trip.id ? "z-50 ring-2 ring-amber-gold/20" : "z-10 hover:z-20"}`}>
      {/* Cover */}
      <div className="relative h-36 bg-gradient-to-br from-sand-200 to-sand-100 rounded-t-[inherit] overflow-hidden">
        {trip.coverImage ? (
          <img src={trip.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-7xl font-bold text-sand-300/40 select-none">
            {index + 1}
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${status.bg} ${status.text}`}>
            <StatusIcon size={11} /> {status.label}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <PrivacyIcon size={14} className="text-sand-500" />
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/trips/${trip.id}/builder`}
            className="text-[0.9375rem] font-semibold text-sand-900 hover:text-amber-gold transition-colors line-clamp-1"
          >
            {trip.title}
          </Link>
          <div className="relative">
            <button
              onClick={() => setOpenMenuId(openMenuId === trip.id ? null : trip.id)}
              className="p-1 rounded hover:bg-sand-100 text-sand-400"
              aria-label="Trip actions"
            >
              <MoreVertical size={16} />
            </button>
            {openMenuId === trip.id && (
              <div className="absolute right-0 top-8 w-48 bg-white border border-sand-200 rounded-lg shadow-lg py-1 z-50">
                <Link href={`/trips/${trip.id}/builder`} className="flex items-center gap-2 px-3 py-2 text-sm text-sand-700 hover:bg-sand-50">
                  <Eye size={14} /> Open
                </Link>
                
                {/* Status submenu */}
                <div className="relative">
                  <button 
                    onClick={() => setShowStatusMenu(!showStatusMenu)}
                    className="flex items-center justify-between gap-2 px-3 py-2 text-sm text-sand-700 hover:bg-sand-50 w-full text-left"
                  >
                    <span className="flex items-center gap-2"><Clock size={14} /> Change Status</span>
                    <ChevronRight size={12} />
                  </button>
                  {showStatusMenu && (
                    <div className="absolute left-full top-0 ml-1 w-40 bg-white border border-sand-200 rounded-lg shadow-lg py-1 z-50">
                      {STATUS_ORDER.map((s) => {
                        const st = STATUS_STYLES[s];
                        const StIcon = st.icon;
                        return (
                          <button
                            key={s}
                            onClick={() => onStatusChange(trip.id, s)}
                            className={`flex items-center gap-2 px-3 py-2 text-sm w-full text-left hover:bg-sand-50 ${trip.status === s ? "font-bold" : ""} ${st.text}`}
                          >
                            <StIcon size={13} /> {st.label}
                            {trip.status === s && <span className="ml-auto text-xs">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <button onClick={() => onShare(trip.id)} className="flex items-center gap-2 px-3 py-2 text-sm text-sand-700 hover:bg-sand-50 w-full text-left">
                  <Share2 size={14} /> Share
                </button>
                <div className="border-t border-sand-100 my-1" />
                <button onClick={() => onDelete(trip.id, trip.title)} className="flex items-center gap-2 px-3 py-2 text-sm text-red-danger hover:bg-red-danger/5 w-full text-left">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 mt-2 text-xs text-sand-400">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {dayjs(trip.startDate).format("MMM D")} – {dayjs(trip.endDate).format("MMM D")}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={12} /> {trip.cityCount} cities
          </span>
        </div>

        {/* Budget mini bar */}
        {trip.budgetLimit > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-sand-400 mb-1">
              <span className="flex items-center gap-1"><Wallet size={11} /> Budget</span>
              <span className="font-mono">${trip.budgetUsed.toLocaleString()} / ${trip.budgetLimit.toLocaleString()}</span>
            </div>
            <div className="w-full h-1.5 bg-sand-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${budgetPercent > 90 ? "bg-red-danger" : "bg-amber-gold"}`}
                style={{ width: `${Math.min(budgetPercent, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── TRIP LIST ROW ────────────────────────────────────────── */

function TripListRow({ trip, index, openMenuId, setOpenMenuId, onStatusChange, onDelete, onShare }: TripCardProps) {
  const status = STATUS_STYLES[trip.status];
  const StatusIcon = status.icon;
  const PrivacyIcon = PRIVACY_ICONS[trip.privacy];
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  return (
    <div className={`card p-4 flex items-center gap-4 relative transition-all ${openMenuId === trip.id ? "z-50 ring-2 ring-amber-gold/20" : "z-10 hover:z-20"}`}>
      {/* Color dot */}
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sand-200 to-sand-100 shrink-0 flex items-center justify-center text-sand-400 font-bold select-none">
        {index + 1}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/trips/${trip.id}/builder`}
          className="text-sm font-semibold text-sand-900 hover:text-amber-gold transition-colors truncate block"
        >
          {trip.title}
        </Link>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-sand-400">
          <span>{dayjs(trip.startDate).format("MMM D")} – {dayjs(trip.endDate).format("MMM D, YYYY")}</span>
          <span>{trip.cityCount} cities</span>
        </div>
      </div>

      {/* Status + Privacy */}
      <div className="hidden sm:flex items-center gap-2">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${status.bg} ${status.text}`}>
          <StatusIcon size={11} /> {status.label}
        </span>
        <PrivacyIcon size={14} className="text-sand-400" />
      </div>

      {/* Actions */}
      <div className="relative">
        <button
          onClick={() => setOpenMenuId(openMenuId === trip.id ? null : trip.id)}
          className="p-2 rounded-lg hover:bg-sand-100 text-sand-400"
          aria-label="Trip actions"
        >
          <MoreVertical size={16} />
        </button>
        {openMenuId === trip.id && (
          <div className="absolute right-0 top-10 w-48 bg-white border border-sand-200 rounded-lg shadow-lg py-1 z-50">
            <Link href={`/trips/${trip.id}/builder`} className="flex items-center gap-2 px-3 py-2 text-sm text-sand-700 hover:bg-sand-50">
              <Eye size={14} /> Open
            </Link>
            
            {/* Status submenu */}
            <div className="relative">
              <button 
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="flex items-center justify-between gap-2 px-3 py-2 text-sm text-sand-700 hover:bg-sand-50 w-full text-left"
              >
                <span className="flex items-center gap-2"><Clock size={14} /> Change Status</span>
                <ChevronRight size={12} />
              </button>
              {showStatusMenu && (
                <div className="absolute left-full top-0 ml-1 w-40 bg-white border border-sand-200 rounded-lg shadow-lg py-1 z-50">
                  {STATUS_ORDER.map((s) => {
                    const st = STATUS_STYLES[s];
                    const StIcon = st.icon;
                    return (
                      <button
                        key={s}
                        onClick={() => onStatusChange(trip.id, s)}
                        className={`flex items-center gap-2 px-3 py-2 text-sm w-full text-left hover:bg-sand-50 ${trip.status === s ? "font-bold" : ""} ${st.text}`}
                      >
                        <StIcon size={13} /> {st.label}
                        {trip.status === s && <span className="ml-auto text-xs">✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button onClick={() => onShare(trip.id)} className="flex items-center gap-2 px-3 py-2 text-sm text-sand-700 hover:bg-sand-50 w-full text-left">
              <Share2 size={14} /> Share
            </button>
            <div className="border-t border-sand-100 my-1" />
            <button onClick={() => onDelete(trip.id, trip.title)} className="flex items-center gap-2 px-3 py-2 text-sm text-red-danger hover:bg-red-danger/5 w-full text-left">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
