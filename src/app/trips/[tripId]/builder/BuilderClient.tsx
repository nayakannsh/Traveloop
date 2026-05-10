"use client";

import { useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  MapPin,
  Clock,
  Trash2,
  GripVertical,
  Search,
  X,
  CalendarDays,
  Wallet,
  ChevronDown,
  ChevronUp,
  Globe,
  Utensils,
  Mountain,
  Landmark,
  ShoppingBag,
  Music,
  TreePine,
  DollarSign,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { 
  addStopAction, 
  removeStopAction, 
  addActivityAction, 
  removeActivityAction,
  addCustomCityAction
} from "@/app/actions/trip-itinerary";

/* ─── TYPES ────────────────────────────────────────────────── */

interface City {
  id: string;
  name: string;
  country: string;
  costIndex: number;
}

interface Activity {
  id: string;
  title: string;
  category: string;
  cost: number;
  duration: number;
  cityId: string;
}

interface TripActivity {
  id: string;
  activityId: string | null;
  title: string;
  scheduledTime: string;
  customCost: number | null;
}

interface Stop {
  id: string;
  cityId: string;
  cityName: string;
  country: string;
  arrivalDate: string;
  departureDate: string;
  position: number;
  activities: TripActivity[];
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  FOOD: Utensils,
  ADVENTURE: Mountain,
  HISTORICAL: Landmark,
  SHOPPING: ShoppingBag,
  NIGHTLIFE: Music,
  NATURE: TreePine,
};

const CATEGORY_COLORS: Record<string, string> = {
  FOOD: "bg-amber-gold/10 text-amber-gold",
  ADVENTURE: "bg-coral/10 text-coral",
  HISTORICAL: "bg-indigo-accent/10 text-indigo-accent",
  SHOPPING: "bg-teal/10 text-teal",
  NIGHTLIFE: "bg-coral/10 text-coral",
  NATURE: "bg-teal/10 text-teal",
};

/* ─── COMPONENT ────────────────────────────────────────────── */

export default function BuilderClient({ 
  tripId, 
  initialStops, 
  allCities, 
  allActivities 
}: { 
  tripId: string; 
  initialStops: Stop[];
  allCities: City[];
  allActivities: Activity[];
}) {
  const [stops, setStops] = useState<Stop[]>(initialStops);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showCitySearch, setShowCitySearch] = useState(false);
  const [showActivitySearch, setShowActivitySearch] = useState<string | null>(null);
  const [expandedStops, setExpandedStops] = useState<Set<string>>(new Set(initialStops.map((s) => s.id)));

  const totalCost = stops.reduce(
    (sum, s) => sum + s.activities.reduce((a, act) => a + (act.customCost || 0), 0),
    0
  );
  
  const totalDays = stops.length > 0 
    ? dayjs(stops[stops.length-1].departureDate).diff(dayjs(stops[0].arrivalDate), "day") + 1
    : 0;

  function toggleExpand(stopId: string) {
    setExpandedStops((prev) => {
      const next = new Set(prev);
      if (next.has(stopId)) next.delete(stopId);
      else next.add(stopId);
      return next;
    });
  }

  async function handleAddCity(city: City) {
    setIsSyncing(true);
    const lastStop = stops[stops.length - 1];
    const arrival = lastStop
      ? dayjs(lastStop.departureDate).add(1, "day").format("YYYY-MM-DD")
      : dayjs().format("YYYY-MM-DD");
    const departure = dayjs(arrival).add(2, "day").format("YYYY-MM-DD");

    const result = await addStopAction(tripId, city.id, arrival, departure);
    
    if (result.success && result.stop) {
      const newStop: Stop = {
        id: result.stop.id,
        cityId: result.stop.cityId,
        cityName: city.name,
        country: city.country,
        arrivalDate: arrival,
        departureDate: departure,
        position: result.stop.position,
        activities: [],
      };
      setStops((prev) => [...prev, newStop]);
      setExpandedStops((prev) => new Set(prev).add(newStop.id));
      setShowCitySearch(false);
      toast.success(`Added ${city.name} to your trip!`);
    } else {
      toast.error(result.error || "Failed to add city");
    }
    setIsSyncing(false);
  }
  async function handleAddCustomCity(name: string, country: string) {
    setIsSyncing(true);
    const lastStop = stops[stops.length - 1];
    const arrival = lastStop
      ? dayjs(lastStop.departureDate).add(1, "day").format("YYYY-MM-DD")
      : dayjs().format("YYYY-MM-DD");
    const departure = dayjs(arrival).add(2, "day").format("YYYY-MM-DD");

    const result = await addCustomCityAction(tripId, name, country, arrival, departure);
    
    if (result.success && result.stop) {
      const newStop: Stop = {
        id: result.stop.id,
        cityId: result.stop.cityId,
        cityName: name,
        country: country,
        arrivalDate: arrival,
        departureDate: departure,
        position: result.stop.position,
        activities: [],
      };
      setStops((prev) => [...prev, newStop]);
      setExpandedStops((prev) => new Set(prev).add(newStop.id));
      setShowCitySearch(false);
      toast.success(`Added ${name} to your trip!`);
    } else {
      toast.error(result.error || "Failed to add custom city");
    }
    setIsSyncing(false);
  }

  async function handleRemoveStop(stopId: string) {
    const confirmDelete = window.confirm("Are you sure you want to remove this city from your itinerary?");
    if (!confirmDelete) return;

    setIsSyncing(true);
    const result = await removeStopAction(tripId, stopId);
    if (result.success) {
      setStops((prev) => prev.filter((s) => s.id !== stopId));
      toast.success("City removed");
    } else {
      toast.error(result.error || "Failed to remove city");
    }
    setIsSyncing(false);
  }

  async function handleAddActivity(stopId: string, activity: Activity) {
    setIsSyncing(true);
    const result = await addActivityAction(
      tripId, 
      stopId, 
      activity.id, 
      activity.title, 
      "12:00", 
      activity.cost
    );

    if (result.success && result.activity) {
      setStops((prev) =>
        prev.map((s) => {
          if (s.id !== stopId) return s;
          const newAct: TripActivity = {
            id: result.activity!.id,
            activityId: activity.id,
            title: activity.title,
            scheduledTime: "12:00",
            customCost: activity.cost,
          };
          return { ...s, activities: [...s.activities, newAct] };
        })
      );
      setShowActivitySearch(null);
      toast.success("Activity added");
    } else {
      toast.error(result.error || "Failed to add activity");
    }
    setIsSyncing(false);
  }

  async function handleAddCustomActivity(stopId: string, title: string, cost: number) {
    setIsSyncing(true);
    const result = await addActivityAction(
      tripId, 
      stopId, 
      null, 
      title, 
      "12:00", 
      cost
    );

    if (result.success && result.activity) {
      setStops((prev) =>
        prev.map((s) => {
          if (s.id !== stopId) return s;
          const newAct: TripActivity = {
            id: result.activity!.id,
            activityId: null,
            title: title,
            scheduledTime: "12:00",
            customCost: cost,
          };
          return { ...s, activities: [...s.activities, newAct] };
        })
      );
      setShowActivitySearch(null);
      toast.success("Custom activity added");
    } else {
      toast.error(result.error || "Failed to add custom activity");
    }
    setIsSyncing(false);
  }

  async function handleRemoveActivity(stopId: string, activityId: string) {
    setIsSyncing(true);
    const result = await removeActivityAction(tripId, activityId);
    if (result.success) {
      setStops((prev) =>
        prev.map((s) => {
          if (s.id !== stopId) return s;
          return { ...s, activities: s.activities.filter((a) => a.id !== activityId) };
        })
      );
      toast.success("Activity removed");
    } else {
      toast.error(result.error || "Failed to remove activity");
    }
    setIsSyncing(false);
  }

  return (
    <div className="min-h-dvh bg-sand-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-sand-50/80 backdrop-blur-md border-b border-sand-200/60">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <Link href="/trips" className="p-2 -ml-2 rounded-lg hover:bg-sand-100 text-sand-600" aria-label="Back to trips">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-base font-semibold text-sand-900 flex items-center gap-2">
                Itinerary Builder
                {isSyncing && <Loader2 size={14} className="animate-spin text-amber-gold" />}
              </h1>
              <p className="text-[10px] text-sand-400 font-mono uppercase tracking-wider">Syncing with Cloud</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-sand-500">
            <span className="flex items-center gap-1.5"><CalendarDays size={13} /> {totalDays} days</span>
            <span className="flex items-center gap-1.5"><MapPin size={13} /> {stops.length} cities</span>
            <span className="flex items-center gap-1.5"><DollarSign size={13} /> ${totalCost}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-6">
        <div className="grid lg:grid-cols-[1fr_280px] gap-6">
          {/* ─── TIMELINE ─────────────────────────────────────── */}
          <div className="space-y-4">
            {stops.length === 0 && (
               <div className="text-center py-20 bg-white rounded-3xl border border-sand-200 border-dashed">
                 <MapPin size={48} className="mx-auto text-sand-200 mb-4" />
                 <h3 className="text-lg font-serif text-sand-900">Your itinerary is empty</h3>
                 <p className="text-sm text-sand-500 max-w-xs mx-auto mt-2">
                   Start by adding your first destination to build out your dream journey.
                 </p>
                 <button
                  onClick={() => setShowCitySearch(true)}
                  className="btn-primary mt-6 px-8"
                >
                  Add Your First City
                </button>
               </div>
            )}

            {stops.map((stop, idx) => {
              const isExpanded = expandedStops.has(stop.id);
              const stopDays = dayjs(stop.departureDate).diff(dayjs(stop.arrivalDate), "day") + 1;
              const stopCost = stop.activities.reduce((a, act) => a + (act.customCost || 0), 0);

              return (
                <motion.div
                  key={stop.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card overflow-hidden"
                >
                  {/* Stop header */}
                  <div
                    className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none"
                    onClick={() => toggleExpand(stop.id)}
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-gold text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sand-900 text-sm">{stop.cityName}</p>
                      <p className="text-xs text-sand-400">
                        {stop.country} · {dayjs(stop.arrivalDate).format("MMM D")} – {dayjs(stop.departureDate).format("MMM D")} · {stopDays}d
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-sand-500">${stopCost}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveStop(stop.id); }}
                        className="p-1.5 rounded-lg text-sand-400 hover:text-red-danger hover:bg-red-danger/5 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                      {isExpanded ? <ChevronUp size={16} className="text-sand-400" /> : <ChevronDown size={16} className="text-sand-400" />}
                    </div>
                  </div>

                  {/* Activities */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-sand-100 px-5 py-4 space-y-2">
                          {stop.activities.length === 0 && (
                            <p className="text-xs text-sand-400 py-3 text-center">No activities yet. Add one below.</p>
                          )}
                          {stop.activities.map((act) => {
                            const actRef = allActivities.find(a => a.id === act.activityId);
                            const catKey = actRef?.category || "NATURE";
                            const CatIcon = CATEGORY_ICONS[catKey] || Globe;
                            const catColor = CATEGORY_COLORS[catKey] || "bg-sand-100 text-sand-500";

                            return (
                              <div
                                key={act.id}
                                className="flex items-center gap-3 p-3 rounded-lg bg-sand-50 group"
                              >
                                <GripVertical size={14} className="text-sand-300 cursor-grab shrink-0" />
                                <div className={`w-8 h-8 rounded-lg ${catColor} flex items-center justify-center shrink-0`}>
                                  <CatIcon size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-sand-800 truncate">{act.title}</p>
                                  <p className="text-xs text-sand-400 flex items-center gap-2">
                                    <Clock size={10} /> {act.scheduledTime}
                                    <span className="font-mono">${act.customCost || 0}</span>
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleRemoveActivity(stop.id, act.id)}
                                  className="p-1.5 rounded text-sand-300 hover:text-red-danger opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            );
                          })}

                          <button
                            onClick={() => setShowActivitySearch(stop.id)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-sand-300 text-sand-400 text-xs font-medium hover:border-amber-gold hover:text-amber-gold transition-colors"
                          >
                            <Plus size={14} /> Add Activity
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {stops.length > 0 && (
              <button
                onClick={() => setShowCitySearch(true)}
                className="w-full flex items-center justify-center gap-2 py-5 rounded-xl border-2 border-dashed border-sand-300 text-sand-500 font-medium hover:border-amber-gold hover:text-amber-gold transition-colors"
              >
                <Plus size={18} /> Add Another City
              </button>
            )}
          </div>

          {/* ─── SIDEBAR SUMMARY ──────────────────────────────── */}
          <aside className="hidden lg:block space-y-5">
            <div className="card p-5 sticky top-20">
              <h3 className="text-sm font-semibold text-sand-900 mb-4">Trip Summary</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-sand-500">Cities</dt>
                  <dd className="font-semibold text-sand-800">{stops.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sand-500">Total Days</dt>
                  <dd className="font-semibold text-sand-800">{totalDays}</dd>
                </div>
                <div className="flex justify-between border-t border-sand-100 pt-3">
                  <dt className="text-sand-500">Est. Cost</dt>
                  <dd className="font-bold text-amber-gold font-mono">${totalCost}</dd>
                </div>
              </dl>

              <div className="mt-5 pt-4 border-t border-sand-100 space-y-2">
                <Link href={`/trips/${tripId}/budget`} className="btn-secondary w-full text-xs py-2">
                  <Wallet size={14} /> Budget Tracker
                </Link>
                <Link href={`/trips/${tripId}/itinerary`} className="btn-primary w-full text-xs py-2">
                  <CalendarDays size={14} /> View Itinerary
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* ─── SEARCH MODALS ──────────────────────────────────── */}
      <AnimatePresence>
        {showCitySearch && (
          <SearchModal
            title="Add a City"
            onClose={() => setShowCitySearch(false)}
            items={allCities}
            renderItem={(city) => (
              <button
                key={city.id}
                onClick={() => handleAddCity(city)}
                className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-sand-50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center text-teal shrink-0">
                  <MapPin size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-sand-800">{city.name}</p>
                  <p className="text-xs text-sand-400">{city.country}</p>
                </div>
                <span className="text-xs font-mono text-sand-400">Cost: {"$".repeat(city.costIndex)}</span>
              </button>
            )}
            filterFn={(city, q) =>
              city.name.toLowerCase().includes(q) || city.country.toLowerCase().includes(q)
            }
            customEntryContent={
              <CustomCityForm onAdd={handleAddCustomCity} />
            }
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showActivitySearch && (
          <SearchModal
            title="Add Activity"
            onClose={() => setShowActivitySearch(null)}
            items={allActivities.filter((a) => {
              const stop = stops.find((s) => s.id === showActivitySearch);
              return stop ? a.cityId === stop.cityId : true;
            })}
            renderItem={(act) => {
              const CatIcon = CATEGORY_ICONS[act.category] || Globe;
              const catColor = CATEGORY_COLORS[act.category] || "bg-sand-100 text-sand-500";
              return (
                <button
                  key={act.id}
                  onClick={() => handleAddActivity(showActivitySearch!, act)}
                  className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-sand-50 transition-colors text-left"
                >
                  <div className={`w-10 h-10 rounded-lg ${catColor} flex items-center justify-center shrink-0`}>
                    <CatIcon size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-sand-800">{act.title}</p>
                    <p className="text-xs text-sand-400">{act.category} · {act.duration} min</p>
                  </div>
                  <span className="text-xs font-mono text-sand-500">${act.cost}</span>
                </button>
              );
            }}
            filterFn={(act, q) => act.title.toLowerCase().includes(q)}
            customEntryContent={
              <CustomActivityForm onAdd={(title, cost) => handleAddCustomActivity(showActivitySearch!, title, cost)} />
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── GENERIC SEARCH MODAL ─────────────────────────────────── */

function SearchModal<T>({
  title,
  onClose,
  items,
  renderItem,
  filterFn,
  customEntryContent,
}: {
  title: string;
  onClose: () => void;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  filterFn: (item: T, query: string) => boolean;
  customEntryContent?: React.ReactNode;
}) {
  const [query, setQuery] = useState("");
  const filtered = query.trim()
    ? items.filter((item) => filterFn(item, query.toLowerCase()))
    : items;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-sand-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl border border-sand-200 shadow-xl w-full max-w-md max-h-[70vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-sand-100">
          <h2 className="text-base font-semibold text-sand-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-sand-100 text-sand-400">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-400" />
            <input
              type="text"
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input-field pl-9 text-sm"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-1">
          {customEntryContent && (
            <div className="mb-3 pb-3 border-b border-sand-100">
              {customEntryContent}
            </div>
          )}

          {filtered.length === 0 ? (
            <p className="text-sm text-sand-400 text-center py-8">No results found.</p>
          ) : (
            filtered.map(renderItem)
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── CUSTOM CITY FORM ─────────────────────────────────────── */

function CustomCityForm({ onAdd }: { onAdd: (name: string, country: string) => void }) {
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="w-full py-2.5 text-sm text-sand-500 font-medium bg-sand-50/50 hover:bg-sand-50 rounded-lg transition-colors border border-sand-200 border-dashed hover:border-amber-gold hover:text-amber-gold">
        <Plus size={16} className="inline mr-2 -mt-0.5" /> Add Custom City
      </button>
    );
  }

  return (
    <div className="p-4 bg-sand-50 rounded-xl mt-2 border border-sand-200">
      <h4 className="text-sm font-semibold text-sand-900 mb-3 flex items-center gap-2">
        <MapPin size={16} className="text-amber-gold" />
        Add Custom City
      </h4>
      <div className="space-y-3">
        <input 
          type="text"
          placeholder="City Name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="input-field text-sm bg-white"
        />
        <input 
          type="text"
          placeholder="Country Name"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="input-field text-sm bg-white"
        />
        <div className="flex gap-2">
          <button 
            onClick={() => setIsOpen(false)}
            className="flex-1 btn-secondary text-xs py-2"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              if (city.trim() && country.trim()) {
                onAdd(city.trim(), country.trim());
              }
            }}
            disabled={!city.trim() || !country.trim()}
            className="flex-1 btn-primary text-xs py-2 disabled:opacity-50"
          >
            Add City
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── CUSTOM ACTIVITY FORM ─────────────────────────────────── */

function CustomActivityForm({ onAdd }: { onAdd: (title: string, cost: number) => void }) {
  const [title, setTitle] = useState("");
  const [cost, setCost] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="w-full py-2.5 text-sm text-sand-500 font-medium bg-sand-50/50 hover:bg-sand-50 rounded-lg transition-colors border border-sand-200 border-dashed hover:border-amber-gold hover:text-amber-gold">
        <Plus size={16} className="inline mr-2 -mt-0.5" /> Add Custom Activity
      </button>
    );
  }

  return (
    <div className="p-4 bg-sand-50 rounded-xl mt-2 border border-sand-200">
      <h4 className="text-sm font-semibold text-sand-900 mb-3 flex items-center gap-2">
        <Globe size={16} className="text-amber-gold" />
        Add Custom Activity
      </h4>
      <div className="space-y-3">
        <input 
          type="text"
          placeholder="Activity Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-field text-sm bg-white"
        />
        <input 
          type="number"
          placeholder="Estimated Cost ($)"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          className="input-field text-sm bg-white"
          min="0"
        />
        <div className="flex gap-2">
          <button 
            onClick={() => setIsOpen(false)}
            className="flex-1 btn-secondary text-xs py-2"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              if (title.trim()) {
                onAdd(title.trim(), parseFloat(cost) || 0);
              }
            }}
            disabled={!title.trim()}
            className="flex-1 btn-primary text-xs py-2 disabled:opacity-50"
          >
            Add Activity
          </button>
        </div>
      </div>
    </div>
  );
}
