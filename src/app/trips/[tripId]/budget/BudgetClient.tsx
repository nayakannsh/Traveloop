"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Wallet,
  Plus,
  Trash2,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Download,
  FileText,
  CheckCircle2,
  Printer,
  Loader2,
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
import { toast } from "react-hot-toast";
import { updateBudgetAction, markAsPaidAction, updateBudgetLimitAction } from "@/app/actions/budget";
import { Edit2, Save } from "lucide-react";

/* ─── TYPES ────────────────────────────────────────────────── */

type BudgetCategory = "TRANSPORT" | "HOTELS" | "FOOD" | "ACTIVITIES" | "SHOPPING" | "MISC";

interface BudgetEntry {
  id: string;
  category: BudgetCategory;
  estimated: number;
  actual: number;
  isPaid: boolean;
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

/* ─── COMPONENT ────────────────────────────────────────────── */

export default function BudgetClient({ 
  tripId, 
  initialEntries, 
  budgetLimit 
}: { 
  tripId: string; 
  initialEntries: BudgetEntry[];
  budgetLimit: number;
}) {
  const [entries, setEntries] = useState<BudgetEntry[]>(initialEntries);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentLimit, setCurrentLimit] = useState(budgetLimit);
  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [autoSyncLimit, setAutoSyncLimit] = useState(false);

  const totalEstimated = entries.reduce((s, e) => s + e.estimated, 0);
  const totalActual = entries.reduce((s, e) => s + e.actual, 0);
  const remaining = currentLimit - totalActual;
  const overBudget = remaining < 0;
  const usedPercent = currentLimit > 0 ? Math.round((totalActual / currentLimit) * 100) : 0;

  const pieData = entries
    .filter(e => e.actual > 0)
    .map((e) => ({ name: CATEGORY_LABELS[e.category], value: e.actual, color: CATEGORY_COLORS[e.category] }));
    
  const barData = entries.map((e) => ({ 
    name: CATEGORY_LABELS[e.category].split(" ")[0], 
    estimated: e.estimated, 
    actual: e.actual 
  }));

  function handleLocalUpdate(category: BudgetCategory, field: "estimated" | "actual", value: number) {
    const newEntries = entries.map((e) => (e.category === category ? { ...e, [field]: value } : e));
    setEntries(newEntries);
    
    // Optimistically update limit locally if auto-sync is on
    if (field === "estimated" && autoSyncLimit) {
      const newTotal = newEntries.reduce((s, e) => s + e.estimated, 0);
      setCurrentLimit(newTotal);
    }
  }

  async function handleSync(category: BudgetCategory, field: "estimated" | "actual", value: number) {
    setIsSyncing(true);
    const result = await updateBudgetAction(tripId, category, { [field]: value });
    if (!result.success) {
      toast.error("Failed to sync change");
    } else {
      if (field === "estimated" && autoSyncLimit) {
        const newTotal = entries.map(e => e.category === category ? { ...e, [field]: value } : e).reduce((s, e) => s + e.estimated, 0);
        await updateBudgetLimitAction(tripId, newTotal);
      }
    }
    setIsSyncing(false);
  }

  async function handleSaveLimit() {
    setIsEditingLimit(false);
    setIsSyncing(true);
    const result = await updateBudgetLimitAction(tripId, currentLimit);
    if (result.success) {
      toast.success("Budget limit updated");
    } else {
      toast.error("Failed to update limit");
    }
    setIsSyncing(false);
  }

  async function handleMarkAsPaid(category: BudgetCategory) {
    setIsSyncing(true);
    const result = await markAsPaidAction(tripId, category);
    if (result.success) {
      setEntries(prev => prev.map(e => e.category === category ? { ...e, isPaid: true, actual: e.actual || e.estimated } : e));
      toast.success(`${CATEGORY_LABELS[category]} marked as paid`);
    } else {
      toast.error("Failed to mark as paid");
    }
    setIsSyncing(false);
  }

  const handleExportPDF = () => {
    toast.success("Preparing PDF report...");
    window.print();
  };

  const handleDownloadInvoice = (category: BudgetCategory) => {
    const entry = entries.find(e => e.category === category);
    if (!entry) return;
    
    toast.success(`Generating invoice for ${CATEGORY_LABELS[category]}...`);
    
    const content = `
TRAVELOOP - TRIP BUDGET INVOICE
-------------------------------
Trip ID: ${tripId}
Category: ${CATEGORY_LABELS[category]}
Estimated: $${entry.estimated}
Actual Spent: $${entry.actual}
Status: ${entry.isPaid ? 'PAID' : 'PENDING'}
-------------------------------
Date Generated: ${new Date().toLocaleDateString()}
    `;
    
    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoice_${CATEGORY_LABELS[category]}_${tripId}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-dvh bg-sand-50 pb-12">
      <header className="sticky top-0 z-40 bg-sand-50/80 backdrop-blur-md border-b border-sand-200/60 print:hidden">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 -ml-2 rounded-lg hover:bg-sand-100 text-sand-600">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-sand-900 flex items-center gap-2">
                Budget Tracker
                {isSyncing && <Loader2 size={14} className="animate-spin text-amber-gold" />}
              </h1>
              <p className="text-xs text-sand-400">Total budget: ${currentLimit.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
              onClick={handleExportPDF}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-2"
            >
              <Download size={14} /> Export PDF
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8 space-y-8">
        {/* Summary Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-sand-400 font-semibold uppercase tracking-wider">Budget Limit</p>
              {!isEditingLimit && (
                <button onClick={() => setIsEditingLimit(true)} className="text-sand-400 hover:text-amber-gold transition-colors">
                  <Edit2 size={14} />
                </button>
              )}
            </div>
            {isEditingLimit ? (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-bold text-sand-900">$</span>
                <input
                  type="number"
                  value={currentLimit}
                  onChange={(e) => setCurrentLimit(Number(e.target.value))}
                  className="w-full bg-sand-50 border border-sand-200 rounded-md px-2 py-1 text-xl font-bold font-mono text-sand-900 focus:outline-none focus:border-amber-gold"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveLimit()}
                />
                <button onClick={handleSaveLimit} className="p-2 bg-amber-gold text-white rounded-md hover:bg-amber-gold/90 transition-colors">
                  <Save size={16} />
                </button>
              </div>
            ) : (
              <p className="text-2xl font-bold text-sand-900 font-mono">${currentLimit.toLocaleString()}</p>
            )}
            
            <div className="mt-3 flex items-center gap-2">
              <input 
                type="checkbox" 
                id="autoSync" 
                checked={autoSyncLimit} 
                onChange={(e) => {
                  setAutoSyncLimit(e.target.checked);
                  if (e.target.checked) {
                     setCurrentLimit(totalEstimated);
                     updateBudgetLimitAction(tripId, totalEstimated);
                  }
                }} 
                className="rounded border-sand-300 text-amber-gold focus:ring-amber-gold cursor-pointer"
              />
              <label htmlFor="autoSync" className="text-[10px] text-sand-500 font-medium cursor-pointer uppercase tracking-tight">Auto-calculate from estimates</label>
            </div>
          </div>
          <div className="card p-5">
            <p className="text-xs text-sand-400 mb-1 font-semibold uppercase tracking-wider">Total Spent</p>
            <p className={`text-2xl font-bold font-mono ${overBudget ? "text-red-danger" : "text-sand-900"}`}>${totalActual.toLocaleString()}</p>
            <div className="w-full h-2 bg-sand-100 rounded-full mt-3 overflow-hidden">
              <div className={`h-full rounded-full transition-all ${overBudget ? "bg-red-danger" : usedPercent > 80 ? "bg-amber-gold" : "bg-teal"}`} style={{ width: `${Math.min(usedPercent, 100)}%` }} />
            </div>
            <p className="text-[10px] text-sand-400 mt-1.5 font-bold uppercase">{usedPercent}% utilized</p>
          </div>
          <div className={`card p-5 ${overBudget ? "border-red-danger/30" : ""}`}>
            <p className="text-xs text-sand-400 mb-1 font-semibold uppercase tracking-wider">Remaining</p>
            <p className={`text-2xl font-bold font-mono flex items-center gap-2 ${overBudget ? "text-red-danger" : "text-teal"}`}>
              {overBudget && <AlertTriangle size={18} />}
              ${Math.abs(remaining).toLocaleString()}
              {overBudget && <span className="text-xs font-normal">over</span>}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 print:hidden">
          {/* Pie Chart */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-sand-900 mb-4">Spending by Category</h3>
            <div className="h-64">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} strokeWidth={0}>
                      {pieData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `$${value}`} contentStyle={{ borderRadius: "0.5rem", border: "1px solid #E8E2D8", fontSize: "0.8125rem" }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "0.75rem" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sand-400 text-sm italic">No spending data yet</div>
              )}
            </div>
          </div>

          {/* Bar Chart */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-sand-900 mb-4">Estimated vs Actual</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} barGap={4}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#B5A898" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#B5A898" tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(value: any) => `$${value}`} contentStyle={{ borderRadius: "0.5rem", border: "1px solid #E8E2D8", fontSize: "0.8125rem" }} />
                  <Bar dataKey="estimated" name="Estimated" fill="#D4CBC0" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" name="Actual" fill="#E8A020" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Category Table */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-sand-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-sand-900">Budget Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-sand-50 text-sand-500 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-5 py-4 text-left">Category</th>
                  <th className="px-5 py-4 text-right">Estimated</th>
                  <th className="px-5 py-4 text-right">Actual</th>
                  <th className="px-5 py-4 text-center print:hidden">Status</th>
                  <th className="px-5 py-4 text-right print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                {entries.map((e) => {
                  const diff = e.estimated - e.actual;
                  return (
                    <tr key={e.id || e.category} className="hover:bg-sand-50/50 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: CATEGORY_COLORS[e.category] }} />
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-sand-800 block truncate">{CATEGORY_LABELS[e.category]}</span>
                            <div className="w-24 h-1 bg-sand-100 rounded-full mt-1 overflow-hidden sm:hidden">
                              <div className={`h-full ${e.actual > e.estimated ? 'bg-red-danger' : 'bg-teal'}`} style={{ width: `${Math.min((e.actual / (e.estimated || 1)) * 100, 100)}%` }} />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <input 
                          type="number" 
                          value={e.estimated} 
                          onChange={(ev) => handleLocalUpdate(e.category, "estimated", Number(ev.target.value))} 
                          onBlur={(ev) => handleSync(e.category, "estimated", Number(ev.target.value))}
                          className="w-24 text-right bg-transparent border-none focus:ring-2 focus:ring-amber-gold/20 rounded-md py-1 font-mono text-sm transition-all" 
                          suppressHydrationWarning
                        />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <input 
                            type="number" 
                            value={e.actual} 
                            onChange={(ev) => handleLocalUpdate(e.category, "actual", Number(ev.target.value))} 
                            onBlur={(ev) => handleSync(e.category, "actual", Number(ev.target.value))}
                            className={`w-24 text-right bg-transparent border-none focus:ring-2 focus:ring-amber-gold/20 rounded-md py-1 font-mono text-sm transition-all ${e.actual > e.estimated ? 'text-red-danger font-bold underline decoration-red-danger/30' : 'text-sand-800'}`} 
                            suppressHydrationWarning
                          />
                          <div className="w-20 h-1 bg-sand-100 rounded-full mt-0.5 overflow-hidden hidden sm:block">
                            <div className={`h-full transition-all duration-500 ${e.actual > e.estimated ? 'bg-red-danger' : 'bg-teal'}`} style={{ width: `${Math.min((e.actual / (e.estimated || 1)) * 100, 100)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center print:hidden">
                        {e.isPaid ? (
                          <div className="flex items-center justify-center">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-teal bg-teal/10 px-2.5 py-1 rounded-full uppercase tracking-tight ring-1 ring-teal/20 shadow-sm">
                              <CheckCircle2 size={12} /> Settled
                            </span>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleMarkAsPaid(e.category)}
                            disabled={isSyncing}
                            className="text-[10px] font-bold text-sand-400 hover:text-amber-gold hover:bg-amber-gold/5 px-2.5 py-1 rounded-full transition-all uppercase tracking-tight border border-transparent hover:border-amber-gold/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            suppressHydrationWarning
                          >
                            {isSyncing ? "Syncing..." : "Mark Paid"}
                          </button>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right print:hidden">
                        <button 
                          onClick={() => handleDownloadInvoice(e.category)}
                          className="p-2 rounded-lg hover:bg-sand-100 text-sand-300 hover:text-sand-600 transition-all opacity-0 group-hover:opacity-100"
                          title="Download Receipt"
                        >
                          <Download size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-sand-50 font-bold border-t-2 border-sand-200">
                  <td className="px-5 py-4 text-sand-900">Total</td>
                  <td className="px-5 py-4 text-right font-mono text-sand-700">${totalEstimated.toLocaleString()}</td>
                  <td className="px-5 py-4 text-right font-mono text-sand-700">${totalActual.toLocaleString()}</td>
                  <td colSpan={2} className="px-5 py-4 text-right font-mono print:hidden">
                    <span className={totalEstimated - totalActual >= 0 ? "text-teal" : "text-red-danger"}>
                      {totalEstimated - totalActual >= 0 ? "Savings: " : "Over: "}
                      ${Math.abs(totalEstimated - totalActual).toLocaleString()}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @media print {
          header, .print-hidden { display: none !important; }
          .card { border: none !important; box-shadow: none !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}
