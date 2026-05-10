"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import {
  ArrowLeft,
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Plane,
  BarChart3,
  PieChart as PieChartIcon,
  Search,
  FileText,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-hot-toast";

/* ─── TYPES ────────────────────────────────────────────────── */

type BudgetCategory = "TRANSPORT" | "HOTELS" | "FOOD" | "ACTIVITIES" | "SHOPPING" | "MISC";

interface BudgetEntry {
  category: BudgetCategory;
  estimated: number;
  actual: number;
  isPaid: boolean;
}

interface TripBudgetData {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: string;
  budgetLimit: number;
  totalSpent: number;
  totalEstimated: number;
  entries: BudgetEntry[];
}

const CATEGORY_COLORS: Record<BudgetCategory, string> = {
  TRANSPORT: "#E8A020",
  HOTELS: "#2C6E6A",
  FOOD: "#E8692C",
  ACTIVITIES: "#5B4FCF",
  SHOPPING: "#C0392B",
  MISC: "#8C7E6E",
};

const CATEGORY_LABELS: Record<BudgetCategory, string> = {
  TRANSPORT: "Transport",
  HOTELS: "Hotels",
  FOOD: "Food & Dining",
  ACTIVITIES: "Activities",
  SHOPPING: "Shopping",
  MISC: "Miscellaneous",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PLANNED: "Planned",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

/* ─── COMPONENT ────────────────────────────────────────────── */

export default function BudgetOverviewClient({ trips }: { trips: TripBudgetData[] }) {
  const [selectedTripId, setSelectedTripId] = useState<string>(trips[0]?.id || "");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [tripSearch, setTripSearch] = useState("");

  // Global stats across ALL trips
  const globalStats = useMemo(() => {
    const totalSpent = trips.reduce((s, t) => s + t.totalSpent, 0);
    const totalBudget = trips.reduce((s, t) => s + t.budgetLimit, 0);
    const totalEstimated = trips.reduce((s, t) => s + t.totalEstimated, 0);

    // Aggregate by category across all trips
    const categoryTotals: Record<BudgetCategory, { estimated: number; actual: number }> = {
      TRANSPORT: { estimated: 0, actual: 0 },
      HOTELS: { estimated: 0, actual: 0 },
      FOOD: { estimated: 0, actual: 0 },
      ACTIVITIES: { estimated: 0, actual: 0 },
      SHOPPING: { estimated: 0, actual: 0 },
      MISC: { estimated: 0, actual: 0 },
    };

    for (const trip of trips) {
      for (const entry of trip.entries) {
        categoryTotals[entry.category].estimated += entry.estimated;
        categoryTotals[entry.category].actual += entry.actual;
      }
    }

    return { totalSpent, totalBudget, totalEstimated, categoryTotals };
  }, [trips]);

  // Selected trip data
  const selectedTrip = trips.find((t) => t.id === selectedTripId) || null;

  // Pie data for global
  const globalPieData = Object.entries(globalStats.categoryTotals)
    .filter(([, v]) => v.actual > 0)
    .map(([cat, v]) => ({
      name: CATEGORY_LABELS[cat as BudgetCategory],
      value: v.actual,
      color: CATEGORY_COLORS[cat as BudgetCategory],
    }));

  // Bar data for global (all trips spending comparison)
  const tripsBarData = trips
    .filter((t) => t.totalSpent > 0 || t.budgetLimit > 0)
    .slice(0, 8)
    .map((t) => ({
      name: t.title.length > 12 ? t.title.slice(0, 12) + "…" : t.title,
      budget: t.budgetLimit,
      spent: t.totalSpent,
    }));

  // Selected trip pie/bar data
  const tripPieData = selectedTrip
    ? selectedTrip.entries
        .filter((e) => e.actual > 0)
        .map((e) => ({
          name: CATEGORY_LABELS[e.category],
          value: e.actual,
          color: CATEGORY_COLORS[e.category],
        }))
    : [];

  const tripBarData = selectedTrip
    ? selectedTrip.entries.map((e) => ({
        name: CATEGORY_LABELS[e.category].split(" ")[0],
        estimated: e.estimated,
        actual: e.actual,
      }))
    : [];

  const globalRemaining = globalStats.totalBudget - globalStats.totalSpent;
  const globalOverBudget = globalRemaining < 0;
  const globalPercent = globalStats.totalBudget > 0 ? Math.round((globalStats.totalSpent / globalStats.totalBudget) * 100) : 0;

  const tripRemaining = selectedTrip ? selectedTrip.budgetLimit - selectedTrip.totalSpent : 0;
  const tripOverBudget = tripRemaining < 0;
  const tripPercent = selectedTrip && selectedTrip.budgetLimit > 0
    ? Math.round((selectedTrip.totalSpent / selectedTrip.budgetLimit) * 100)
    : 0;

  // ─── PDF EXPORT HANDLERS ───────────────────────────────────

  const exportGlobalPDF = () => {
    const doc = new jsPDF();
    const now = dayjs().format("MMM D, YYYY HH:mm");

    // Title & Header
    doc.setFontSize(22);
    doc.setTextColor(44, 110, 106); // Emerald/Teal
    doc.text("Traveloop Global Budget Summary", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on ${now}`, 14, 30);
    doc.text(`${trips.length} trips tracked`, 14, 35);

    // Summary Box
    doc.setDrawColor(232, 226, 216); // Cream-200
    doc.setFillColor(252, 251, 249); // Sand-50
    doc.rect(14, 42, 182, 30, "FD");
    
    doc.setFontSize(10);
    doc.setTextColor(140, 126, 110); // Sand-400
    doc.text("TOTAL BUDGET", 20, 52);
    doc.text("TOTAL SPENT", 80, 52);
    doc.text("REMAINING", 140, 52);

    doc.setFontSize(16);
    doc.setTextColor(44, 40, 36); // Sand-900
    doc.text(`$${globalStats.totalBudget.toLocaleString()}`, 20, 62);
    doc.text(`$${globalStats.totalSpent.toLocaleString()}`, 80, 62);
    doc.setTextColor(globalOverBudget ? 192 : 44, globalOverBudget ? 57 : 110, globalOverBudget ? 43 : 106);
    doc.text(`$${Math.abs(globalRemaining).toLocaleString()}${globalOverBudget ? " (Over)" : ""}`, 140, 62);

    // Category Table
    doc.setFontSize(14);
    doc.setTextColor(44, 40, 36);
    doc.text("Spending by Category", 14, 85);

    const categoryData = (Object.keys(CATEGORY_LABELS) as BudgetCategory[]).map(cat => {
      const data = globalStats.categoryTotals[cat];
      return [
        CATEGORY_LABELS[cat],
        `$${data.estimated.toLocaleString()}`,
        `$${data.actual.toLocaleString()}`,
        `${data.estimated > 0 ? Math.round((data.actual / data.estimated) * 100) : 0}%`
      ];
    });

    autoTable(doc, {
      startY: 92,
      head: [["Category", "Estimated", "Actual", "Utilization"]],
      body: categoryData,
      theme: "striped",
      headStyles: { fillColor: [44, 110, 106], fontSize: 10 },
      bodyStyles: { fontSize: 9 },
    });

    // Trips Table
    doc.setFontSize(14);
    doc.setTextColor(44, 40, 36);
    doc.text("Per-Trip Breakdown", 14, (doc as any).lastAutoTable.finalY + 15);

    const tripData = trips.map(t => [
      t.title,
      dayjs(t.startDate).format("MMM YYYY"),
      `$${t.budgetLimit.toLocaleString()}`,
      `$${t.totalSpent.toLocaleString()}`,
      `$${(t.budgetLimit - t.totalSpent).toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 22,
      head: [["Trip", "Date", "Budget", "Spent", "Balance"]],
      body: tripData,
      theme: "grid",
      headStyles: { fillColor: [232, 160, 32], fontSize: 10 }, // Amber Gold
      bodyStyles: { fontSize: 9 },
    });

    doc.save(`traveloop_global_budget_${dayjs().format("YYYY-MM-DD")}.pdf`);
    toast.success("Global report exported");
  };

  const exportTripPDF = () => {
    if (!selectedTrip) return;
    const doc = new jsPDF();
    const now = dayjs().format("MMM D, YYYY HH:mm");

    doc.setFontSize(22);
    doc.setTextColor(232, 160, 32); // Amber Gold
    doc.text(`Trip Budget: ${selectedTrip.title}`, 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`${dayjs(selectedTrip.startDate).format("MMM D")} – ${dayjs(selectedTrip.endDate).format("MMM D, YYYY")}`, 14, 30);
    doc.text(`Status: ${STATUS_LABELS[selectedTrip.status] || selectedTrip.status}`, 14, 35);

    // Stats Cards
    doc.setFillColor(252, 251, 249);
    doc.rect(14, 42, 182, 30, "F");
    
    doc.setFontSize(10);
    doc.setTextColor(140, 126, 110);
    doc.text("BUDGET LIMIT", 20, 52);
    doc.text("ACTUAL SPENT", 80, 52);
    doc.text("REMAINING", 140, 52);

    doc.setFontSize(16);
    doc.setTextColor(44, 40, 36);
    doc.text(`$${selectedTrip.budgetLimit.toLocaleString()}`, 20, 62);
    doc.text(`$${selectedTrip.totalSpent.toLocaleString()}`, 80, 62);
    doc.setTextColor(tripOverBudget ? 192 : 44, tripOverBudget ? 57 : 110, tripOverBudget ? 43 : 106);
    doc.text(`$${Math.abs(tripRemaining).toLocaleString()}`, 140, 62);

    // Detail Table
    doc.setFontSize(14);
    doc.setTextColor(44, 40, 36);
    doc.text("Category Breakdown", 14, 85);

    const breakdownData = selectedTrip.entries.map(e => [
      CATEGORY_LABELS[e.category],
      `$${e.estimated.toLocaleString()}`,
      `$${e.actual.toLocaleString()}`,
      e.isPaid ? "Paid" : "Pending"
    ]);

    autoTable(doc, {
      startY: 92,
      head: [["Category", "Estimated", "Actual", "Status"]],
      body: breakdownData,
      theme: "striped",
      headStyles: { fillColor: [44, 110, 106], fontSize: 10 },
      bodyStyles: { fontSize: 9 },
      columnStyles: { 3: { halign: 'center' } }
    });

    doc.save(`traveloop_${selectedTrip.title.toLowerCase().replace(/\s+/g, '_')}_budget.pdf`);
    toast.success(`${selectedTrip.title} report exported`);
  };

  if (trips.length === 0) {
    return (
      <div className="min-h-dvh bg-sand-50">
        <header className="sticky top-0 z-40 bg-sand-50/80 backdrop-blur-md border-b border-sand-200/60">
          <div className="mx-auto max-w-7xl flex items-center gap-4 px-5 py-3.5">
            <Link href="/dashboard" className="p-2 -ml-2 rounded-lg hover:bg-sand-100 text-sand-600"><ArrowLeft size={20} /></Link>
            <h1 className="text-lg font-semibold text-sand-900">Budget Overview</h1>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-5 py-20 text-center">
          <Wallet size={48} className="text-sand-300 mx-auto mb-4" />
          <p className="text-sand-500 mb-4">No trips yet. Create your first trip to start tracking budgets.</p>
          <Link href="/trips/new" className="btn-primary text-sm">Create Trip</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-sand-50 pb-12">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-sand-50/80 backdrop-blur-md border-b border-sand-200/60">
        <div className="mx-auto max-w-7xl flex items-center gap-4 px-5 py-3.5">
          <Link href="/dashboard" className="p-2 -ml-2 rounded-lg hover:bg-sand-100 text-sand-600"><ArrowLeft size={20} /></Link>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-sand-900 flex items-center gap-2">
              <Wallet size={20} className="text-amber-gold" /> Budget Overview
            </h1>
            <p className="text-xs text-sand-400">{trips.length} trip{trips.length !== 1 ? "s" : ""} tracked</p>
          </div>
          <button
            onClick={exportGlobalPDF}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-sand-200 rounded-xl text-xs font-bold text-sand-600 hover:bg-sand-50 transition-colors"
          >
            <FileText size={14} /> Export Summary (PDF)
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8">
        {/* Two-panel layout */}
        <div className="grid lg:grid-cols-2 gap-8">

          {/* LEFT PANEL */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center text-teal">
                <BarChart3 size={16} />
              </div>
              <h2 className="text-base font-bold text-sand-900">All Trips Summary</h2>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="card p-4">
                <p className="text-[10px] text-sand-400 font-bold uppercase tracking-wider mb-1">Total Budget</p>
                <p className="text-xl font-bold text-sand-900 font-mono">${globalStats.totalBudget.toLocaleString()}</p>
              </div>
              <div className="card p-4">
                <p className="text-[10px] text-sand-400 font-bold uppercase tracking-wider mb-1">Total Spent</p>
                <p className={`text-xl font-bold font-mono ${globalOverBudget ? "text-red-danger" : "text-sand-900"}`}>
                  ${globalStats.totalSpent.toLocaleString()}
                </p>
              </div>
              <div className={`card p-4 ${globalOverBudget ? "border-red-danger/20" : ""}`}>
                <p className="text-[10px] text-sand-400 font-bold uppercase tracking-wider mb-1">Remaining</p>
                <p className={`text-xl font-bold font-mono flex items-center gap-1 ${globalOverBudget ? "text-red-danger" : "text-teal"}`}>
                  {globalOverBudget && <AlertTriangle size={14} />}
                  ${Math.abs(globalRemaining).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-sand-600">Overall Utilization</span>
                <span className="text-xs font-bold text-sand-900">{globalPercent}%</span>
              </div>
              <div className="w-full h-3 bg-sand-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${globalOverBudget ? "bg-red-danger" : globalPercent > 80 ? "bg-amber-gold" : "bg-teal"}`}
                  style={{ width: `${Math.min(globalPercent, 100)}%` }}
                />
              </div>
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-semibold text-sand-900 mb-4 flex items-center gap-2">
                <PieChartIcon size={14} className="text-sand-400" /> Spending by Category
              </h3>
              <div className="h-56">
                {globalPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={globalPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} strokeWidth={0}>
                        {globalPieData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                      </Pie>
                      <Tooltip formatter={(value: any) => `$${value}`} contentStyle={{ borderRadius: "0.5rem", border: "1px solid #E8E2D8", fontSize: "0.8125rem" }} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "0.7rem" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sand-400 text-sm italic">No spending data yet</div>
                )}
              </div>
            </div>

            {tripsBarData.length > 1 && (
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-sand-900 mb-4 flex items-center gap-2">
                  <BarChart3 size={14} className="text-sand-400" /> Budget vs Spent by Trip
                </h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tripsBarData} barGap={4}>
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#B5A898" />
                      <YAxis tick={{ fontSize: 10 }} stroke="#B5A898" tickFormatter={(v) => `$${v}`} />
                      <Tooltip formatter={(value: any) => `$${value}`} contentStyle={{ borderRadius: "0.5rem", border: "1px solid #E8E2D8", fontSize: "0.8125rem" }} />
                      <Bar dataKey="budget" name="Budget" fill="#D4CBC0" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="spent" name="Spent" fill="#E8A020" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANEL — Per-Trip Breakdown */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-gold/10 flex items-center justify-center text-amber-gold">
                  <Plane size={16} />
                </div>
                <h2 className="text-base font-bold text-sand-900">Trip Breakdown</h2>
              </div>
              <button
                onClick={exportTripPDF}
                className="p-2 text-sand-400 hover:text-amber-gold transition-colors"
                title="Export trip PDF"
              >
                <FileText size={18} />
              </button>
            </div>

            {/* Trip Selector with Search */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full card p-4 flex items-center justify-between hover:border-sand-300 transition-colors"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-amber-gold/10 flex items-center justify-center text-amber-gold shrink-0">
                    <Plane size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-sand-900">{selectedTrip?.title || "Select a trip"}</p>
                    {selectedTrip && (
                      <p className="text-xs text-sand-400">
                        {dayjs(selectedTrip.startDate).format("MMM D")} – {dayjs(selectedTrip.endDate).format("MMM D, YYYY")}
                      </p>
                    )}
                  </div>
                </div>
                <ChevronDown size={16} className={`text-sand-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-sand-200 rounded-xl shadow-xl z-50">
                  <div className="p-2 border-b border-sand-100">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-400" />
                      <input
                        type="text"
                        placeholder="Search trips..."
                        value={tripSearch}
                        onChange={(e) => setTripSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full pl-9 pr-4 py-2 text-xs bg-sand-50 rounded-lg outline-none focus:ring-1 focus:ring-amber-gold border-none"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {trips
                      .filter(t => t.title.toLowerCase().includes(tripSearch.toLowerCase()))
                      .map((trip) => (
                        <button
                          key={trip.id}
                          onClick={() => { setSelectedTripId(trip.id); setDropdownOpen(false); setTripSearch(""); }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-sand-50 transition-colors ${trip.id === selectedTripId ? "bg-sand-50" : ""}`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-sand-100 flex items-center justify-center text-sand-400 shrink-0">
                            <Plane size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-sand-900 truncate">{trip.title}</p>
                            <p className="text-xs text-sand-400">{dayjs(trip.startDate).format("MMM D")} – {dayjs(trip.endDate).format("MMM D")}</p>
                          </div>
                          {trip.id === selectedTripId && <CheckCircle2 size={14} className="text-teal shrink-0" />}
                        </button>
                      ))}
                    {trips.filter(t => t.title.toLowerCase().includes(tripSearch.toLowerCase())).length === 0 && (
                      <div className="p-4 text-center text-xs text-sand-400 italic">No trips found</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {selectedTrip && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div className="card p-4">
                    <p className="text-[10px] text-sand-400 font-bold uppercase tracking-wider mb-1">Budget</p>
                    <p className="text-xl font-bold text-sand-900 font-mono">${selectedTrip.budgetLimit.toLocaleString()}</p>
                  </div>
                  <div className="card p-4">
                    <p className="text-[10px] text-sand-400 font-bold uppercase tracking-wider mb-1">Spent</p>
                    <p className={`text-xl font-bold font-mono ${tripOverBudget ? "text-red-danger" : "text-sand-900"}`}>
                      ${selectedTrip.totalSpent.toLocaleString()}
                    </p>
                  </div>
                  <div className={`card p-4 ${tripOverBudget ? "border-red-danger/20" : ""}`}>
                    <p className="text-[10px] text-sand-400 font-bold uppercase tracking-wider mb-1">Remaining</p>
                    <p className={`text-xl font-bold font-mono ${tripOverBudget ? "text-red-danger" : "text-teal"}`}>
                      ${Math.abs(tripRemaining).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-sand-600">Trip Utilization</span>
                    <span className="text-xs font-bold text-sand-900">{tripPercent}%</span>
                  </div>
                  <div className="w-full h-3 bg-sand-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${tripOverBudget ? "bg-red-danger" : tripPercent > 80 ? "bg-amber-gold" : "bg-teal"}`}
                      style={{ width: `${Math.min(tripPercent, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="card p-5">
                  <h3 className="text-sm font-semibold text-sand-900 mb-4 flex items-center gap-2">
                    <PieChartIcon size={14} className="text-sand-400" /> Spending Breakdown
                  </h3>
                  <div className="h-52">
                    {tripPieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={tripPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} strokeWidth={0}>
                            {tripPieData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                          </Pie>
                          <Tooltip formatter={(value: any) => `$${value}`} contentStyle={{ borderRadius: "0.5rem", border: "1px solid #E8E2D8", fontSize: "0.8125rem" }} />
                          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "0.7rem" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-sand-400 text-sm italic">No spending on this trip yet</div>
                    )}
                  </div>
                </div>

                <div className="card overflow-hidden">
                  <div className="px-5 py-3 border-b border-sand-100 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-sand-900">Category Breakdown</h3>
                    <Link href={`/trips/${selectedTrip.id}/budget`} className="text-xs font-bold text-teal hover:underline">Edit Budget →</Link>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-sand-50 text-[10px] uppercase tracking-widest font-bold text-sand-500">
                        <tr>
                          <th className="px-5 py-3 text-left">Category</th>
                          <th className="px-5 py-3 text-right">Est.</th>
                          <th className="px-5 py-3 text-right">Actual</th>
                          <th className="px-5 py-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sand-100">
                        {selectedTrip.entries.map((e) => (
                          <tr key={e.category} className="hover:bg-sand-50/50 transition-colors">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[e.category] }} />
                                <span className="font-medium text-sand-800">{CATEGORY_LABELS[e.category]}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-right font-mono text-sand-600">${e.estimated.toLocaleString()}</td>
                            <td className={`px-5 py-3 text-right font-mono font-semibold ${e.actual > e.estimated ? "text-red-danger" : "text-sand-800"}`}>
                              ${e.actual.toLocaleString()}
                            </td>
                            <td className="px-5 py-3 text-center">
                              {e.isPaid ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal bg-teal/10 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 size={10} /> Paid
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-sand-400">PENDING</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
