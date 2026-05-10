"use client";

import { useState, use } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { ArrowLeft, Plus, Trash2, Clock, StickyNote, Save, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

/* ─── TYPES ────────────────────────────────────────────────── */

interface Note {
  id: string;
  dayIndex: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const TRIP_START = "2026-06-15";

const INITIAL_NOTES: Note[] = [
  { id: "n1", dayIndex: 1, content: "Arrived in Bangkok! The heat hit immediately. Checked into the hotel near Khao San Road. Had the most amazing pad thai from a street vendor right around the corner.", createdAt: "2026-06-15T14:30:00", updatedAt: "2026-06-15T14:30:00" },
  { id: "n2", dayIndex: 2, content: "Grand Palace was incredible — the detail in the architecture is unreal. Spent 3 hours just wandering. Tip: go early to avoid crowds. Also tried mango sticky rice from a market stall.", createdAt: "2026-06-16T19:00:00", updatedAt: "2026-06-16T20:15:00" },
  { id: "n3", dayIndex: 4, content: "Chiang Mai is such a contrast to Bangkok — quieter, greener. The temple at Doi Suthep had panoramic views of the whole city. Cooking class tomorrow!", createdAt: "2026-06-18T18:45:00", updatedAt: "2026-06-18T18:45:00" },
];

/* ─── PAGE ─────────────────────────────────────────────────── */

export default function NotesPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params);
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newDay, setNewDay] = useState(1);
  const [newContent, setNewContent] = useState("");

  function startEdit(note: Note) {
    setEditingId(note.id);
    setEditContent(note.content);
  }

  function saveEdit(id: string) {
    if (!editContent.trim()) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, content: editContent.trim(), updatedAt: new Date().toISOString() } : n
      )
    );
    setEditingId(null);
    toast.success("Note updated");
  }

  function addNote() {
    if (!newContent.trim()) return;
    const note: Note = {
      id: `n-${Date.now()}`,
      dayIndex: newDay,
      content: newContent.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [...prev, note].sort((a, b) => a.dayIndex - b.dayIndex));
    setNewContent("");
    setIsAdding(false);
    toast.success("Note added");
  }

  function deleteNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    toast.success("Note deleted");
  }

  return (
    <div className="min-h-dvh bg-sand-50">
      <header className="sticky top-0 z-40 bg-sand-50/80 backdrop-blur-md border-b border-sand-200/60">
        <div className="mx-auto max-w-3xl flex items-center gap-4 px-5 py-3.5">
          <Link href="/dashboard" className="p-2 -ml-2 rounded-lg hover:bg-sand-100 text-sand-600" aria-label="Back"><ArrowLeft size={20} /></Link>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-sand-900">Trip Notes</h1>
            <p className="text-xs text-sand-400">{notes.length} {notes.length === 1 ? "note" : "notes"}</p>
          </div>
          <button onClick={() => setIsAdding(true)} className="btn-primary text-sm py-2 px-4"><Plus size={15} /> Add Note</button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-8 space-y-5">
        {/* Add Note Form */}
        {isAdding && (
          <div className="card p-5 space-y-4 border-amber-gold/30">
            <h3 className="text-sm font-semibold text-sand-900">New Note</h3>
            <div>
              <label htmlFor="note-day" className="block text-xs font-medium text-sand-600 mb-1">Day</label>
              <select id="note-day" value={newDay} onChange={(e) => setNewDay(Number(e.target.value))} className="input-field text-sm w-32">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>Day {d} — {dayjs(TRIP_START).add(d - 1, "day").format("MMM D")}</option>
                ))}
              </select>
            </div>
            <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} rows={4} placeholder="What happened today? Write your thoughts…" className="input-field text-sm resize-none" aria-label="Note content" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setIsAdding(false)} className="btn-secondary text-xs py-2 px-4">Cancel</button>
              <button onClick={addNote} className="btn-primary text-xs py-2 px-4"><Save size={13} /> Save Note</button>
            </div>
          </div>
        )}

        {/* Notes List */}
        {notes.length === 0 ? (
          <div className="text-center py-16">
            <StickyNote size={40} className="text-sand-300 mx-auto mb-3" />
            <p className="text-sm text-sand-500">No notes yet. Capture your memories!</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="card p-5 group">
              {/* Day badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-gold/10 text-amber-gold text-xs font-semibold">
                    Day {note.dayIndex}
                  </span>
                  <span className="text-xs text-sand-400">
                    {dayjs(TRIP_START).add(note.dayIndex - 1, "day").format("ddd, MMM D")}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-sand-300 flex items-center gap-1">
                    <Clock size={10} />
                    {dayjs(note.updatedAt).format("h:mm A")}
                  </span>
                  <button onClick={() => deleteNote(note.id)} className="p-1.5 rounded text-sand-300 hover:text-red-danger opacity-0 group-hover:opacity-100 transition-all" aria-label="Delete note"><Trash2 size={13} /></button>
                </div>
              </div>

              {/* Content */}
              {editingId === note.id ? (
                <div className="space-y-3">
                  <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={4} className="input-field text-sm resize-none" />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingId(null)} className="btn-secondary text-xs py-1.5 px-3">Cancel</button>
                    <button onClick={() => saveEdit(note.id)} className="btn-primary text-xs py-1.5 px-3"><Save size={12} /> Save</button>
                  </div>
                </div>
              ) : (
                <p onClick={() => startEdit(note)} className="text-sm text-sand-700 leading-relaxed whitespace-pre-wrap cursor-text hover:bg-sand-50 rounded-lg p-2 -m-2 transition-colors" role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") startEdit(note); }} aria-label="Click to edit note">
                  {note.content}
                </p>
              )}
            </div>
          ))
        )}
      </main>
    </div>
  );
}
