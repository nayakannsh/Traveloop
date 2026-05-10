"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Plus, Trash2, Check, RotateCcw, 
  Shirt, Laptop, FileText, Pill, Droplets, Package, X,
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import { 
  addPackingItemAction, 
  togglePackingItemAction, 
  removePackingItemAction, 
  resetPackingItemsAction 
} from "@/app/actions/packing";

/* ─── TYPES ────────────────────────────────────────────────── */

type PackCategory = "CLOTHING" | "ELECTRONICS" | "DOCUMENTS" | "TOILETRIES" | "MEDICINES" | "MISC";

interface PackItem { 
  id: string; 
  title: string; 
  category: PackCategory; 
  completed: boolean; 
}

const CAT_META: Record<PackCategory, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  CLOTHING:    { label: "Clothing",      icon: Shirt,    color: "bg-amber-gold/10 text-amber-gold", bg: "bg-amber-gold" },
  ELECTRONICS: { label: "Electronics",   icon: Laptop,   color: "bg-indigo-accent/10 text-indigo-accent", bg: "bg-indigo-accent" },
  DOCUMENTS:   { label: "Documents",     icon: FileText, color: "bg-teal/10 text-teal", bg: "bg-teal" },
  TOILETRIES:  { label: "Toiletries",    icon: Droplets, color: "bg-coral/10 text-coral", bg: "bg-coral" },
  MEDICINES:   { label: "Medicines",     icon: Pill,     color: "bg-red-danger/10 text-red-danger", bg: "bg-red-danger" },
  MISC:        { label: "Miscellaneous", icon: Package,  color: "bg-sand-200 text-sand-600", bg: "bg-sand-600" },
};

const ALL_CATEGORIES = Object.keys(CAT_META) as PackCategory[];

/* ─── COMPONENT ────────────────────────────────────────────── */

export function PackingClient({ tripId, initialItems }: { tripId: string, initialItems: PackItem[] }) {
  const [items, setItems] = useState<PackItem[]>(initialItems);
  const [newItem, setNewItem] = useState("");
  const [newCat, setNewCat] = useState<PackCategory>("CLOTHING");
  const [inlineAddCat, setInlineAddCat] = useState<PackCategory | null>(null);
  const [inlineText, setInlineText] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  const total = items.length;
  const packed = items.filter((i) => i.completed).length;
  const percent = total > 0 ? Math.round((packed / total) * 100) : 0;

  const grouped = useMemo(() => {
    const map = new Map<PackCategory, PackItem[]>();
    for (const cat of ALL_CATEGORIES) map.set(cat, []);
    for (const item of items) map.get(item.category)!.push(item);
    return map;
  }, [items]);

  async function handleAdd(title: string, category: PackCategory, isInline = false) {
    if (!title.trim()) return;
    
    setIsSyncing(true);
    const result = await addPackingItemAction(tripId, title.trim(), category);
    
    if (result.success && result.item) {
      setItems(prev => [...prev, {
        id: result.item!.id,
        title: result.item!.title,
        category: result.item!.category as any,
        completed: result.item!.completed
      }]);
      if (isInline) setInlineText("");
      else setNewItem("");
      toast.success(`Added ${title}`);
    } else {
      toast.error("Failed to add item");
    }
    setIsSyncing(false);
  }

  async function handleToggle(id: string, currentStatus: boolean) {
    // Optimistic update
    setItems(prev => prev.map(i => i.id === id ? { ...i, completed: !currentStatus } : i));
    
    const result = await togglePackingItemAction(tripId, id, !currentStatus);
    if (!result.success) {
      toast.error("Failed to update status");
      // Revert
      setItems(prev => prev.map(i => i.id === id ? { ...i, completed: currentStatus } : i));
    }
  }

  async function handleRemove(id: string) {
    const originalItems = [...items];
    setItems(prev => prev.filter(i => i.id !== id));
    
    const result = await removePackingItemAction(tripId, id);
    if (!result.success) {
      toast.error("Failed to remove item");
      setItems(originalItems);
    }
  }

  async function handleReset() {
    if (!confirm("Reset all items to unpacked?")) return;
    
    setIsSyncing(true);
    const result = await resetPackingItemsAction(tripId);
    if (result.success) {
      setItems(prev => prev.map(i => ({ ...i, completed: false })));
      toast.success("All items reset");
    } else {
      toast.error("Failed to reset items");
    }
    setIsSyncing(false);
  }

  return (
    <div className="min-h-dvh bg-sand-50">
      <header className="sticky top-0 z-40 bg-sand-50/80 backdrop-blur-md border-b border-sand-200/60">
        <div className="mx-auto max-w-3xl flex items-center gap-4 px-5 py-3.5">
          <Link href="/dashboard" className="p-2 -ml-2 rounded-lg hover:bg-sand-100 text-sand-600" aria-label="Back"><ArrowLeft size={20} /></Link>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-sand-900 flex items-center gap-2">
              Packing Checklist {isSyncing && <Loader2 size={14} className="animate-spin text-teal" />}
            </h1>
            <p className="text-xs text-sand-400">{packed}/{total} packed</p>
          </div>
          <button onClick={handleReset} className="btn-secondary text-xs py-2 px-3" aria-label="Reset all"><RotateCcw size={14} /> Reset</button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-8 space-y-6">
        {/* Progress */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-sand-700">Packing Progress</span>
            <span className="text-sm font-bold text-sand-900">{percent}%</span>
          </div>
          <div className="w-full h-3 bg-sand-100 rounded-full overflow-hidden">
            <motion.div className="h-full bg-teal rounded-full" initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 0.5, ease: "easeOut" }} />
          </div>
          {percent === 100 && total > 0 && (
            <p className="text-xs text-teal font-medium mt-2 flex items-center gap-1"><Check size={13} /> All packed! Ready to go 🎒</p>
          )}
        </div>

        {/* Quick Add */}
        <div className="card p-5">
          <h2 className="text-xs font-bold text-sand-500 uppercase tracking-wider mb-3">Quick Add Item</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Type item name here…"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd(newItem, newCat)}
              className="flex-1 input-field text-sm"
              aria-label="New item name"
            />
            <select
              value={newCat}
              onChange={(e) => setNewCat(e.target.value as PackCategory)}
              className="text-sm px-4 py-3 rounded-xl border-2 border-sand-200 bg-white text-sand-800 focus:outline-none focus:border-teal transition-all sm:w-44"
              aria-label="Category"
            >
              {ALL_CATEGORIES.map((k) => (<option key={k} value={k}>{CAT_META[k].label}</option>))}
            </select>
            <button
              onClick={() => handleAdd(newItem, newCat)}
              disabled={!newItem.trim() || isSyncing}
              className="btn-primary text-sm py-3 px-6 shrink-0"
            >
              <Plus size={15} /> Add Item
            </button>
          </div>
        </div>

        {/* Category Sections */}
        {ALL_CATEGORIES.map((cat) => {
          const catItems = grouped.get(cat) || [];
          const meta = CAT_META[cat];
          const CatIcon = meta.icon;
          const catPacked = catItems.filter(i => i.completed).length;

          return (
            <section key={cat} className="card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-lg ${meta.color} flex items-center justify-center`}><CatIcon size={16} /></div>
                <h3 className="text-sm font-bold text-sand-900 flex-1">{meta.label}</h3>
                {catItems.length > 0 && (
                  <span className="text-xs text-sand-400 font-medium">{catPacked}/{catItems.length}</span>
                )}
                <button
                  onClick={() => setInlineAddCat(inlineAddCat === cat ? null : cat)}
                  className={`p-1.5 rounded-lg transition-all ${inlineAddCat === cat ? "bg-red-danger/10 text-red-danger" : "bg-sand-100 text-sand-400 hover:bg-teal/10 hover:text-teal"}`}
                >
                  {inlineAddCat === cat ? <X size={14} /> : <Plus size={14} />}
                </button>
              </div>

              <AnimatePresence>
                {inlineAddCat === cat && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="flex gap-2 mb-4 p-3 rounded-xl bg-sand-50 border border-sand-200">
                      <input
                        type="text"
                        placeholder={`Add to ${meta.label}…`}
                        value={inlineText}
                        onChange={(e) => setInlineText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAdd(inlineText, cat, true)}
                        className="flex-1 text-sm px-3 py-2 rounded-lg border border-sand-200 bg-white text-sand-900 focus:outline-none focus:border-teal transition-all"
                        autoFocus
                      />
                      <button
                        onClick={() => handleAdd(inlineText, cat, true)}
                        disabled={!inlineText.trim() || isSyncing}
                        className="px-4 py-2 rounded-lg bg-teal text-white text-sm font-medium disabled:opacity-40"
                      >
                        Add
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {catItems.length === 0 ? (
                <p className="text-xs text-sand-400 text-center py-4 italic">No items yet</p>
              ) : (
                <div className="space-y-1.5">
                  {catItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      className="flex items-center gap-3 p-3 rounded-lg bg-white border border-sand-100 group hover:border-sand-200 transition-colors"
                    >
                      <button
                        onClick={() => handleToggle(item.id, item.completed)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${item.completed ? "bg-teal border-teal text-white" : "border-sand-300 hover:border-teal"}`}
                      >
                        {item.completed && <Check size={12} strokeWidth={3} />}
                      </button>
                      <span className={`flex-1 text-sm ${item.completed ? "line-through text-sand-400" : "text-sand-800"}`}>
                        {item.title}
                      </span>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="p-1 rounded text-sand-300 hover:text-red-danger opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </main>
    </div>
  );
}
