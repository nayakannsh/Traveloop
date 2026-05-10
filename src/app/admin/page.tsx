"use client";

import { useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import {
  ArrowLeft,
  Users,
  MapPin,
  CalendarDays,
  Activity,
  Search,
  Shield,
  TrendingUp,
  Eye,
  Trash2,
  Ban,
  MoreVertical,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

/* ─── MOCK DATA ────────────────────────────────────────────── */

const STATS = [
  { label: "Total Users", value: "1,247", change: "+12%", icon: Users, color: "text-amber-gold bg-amber-gold/10" },
  { label: "Active Trips", value: "324", change: "+8%", icon: CalendarDays, color: "text-teal bg-teal/10" },
  { label: "Cities Used", value: "87", change: "+5", icon: MapPin, color: "text-coral bg-coral/10" },
  { label: "Uptime", value: "99.8%", change: "—", icon: Activity, color: "text-indigo-accent bg-indigo-accent/10" },
];

const WEEKLY_SIGNUPS = [
  { day: "Mon", count: 18 },
  { day: "Tue", count: 24 },
  { day: "Wed", count: 31 },
  { day: "Thu", count: 19 },
  { day: "Fri", count: 42 },
  { day: "Sat", count: 55 },
  { day: "Sun", count: 37 },
];

const MONTHLY_TRIPS = [
  { month: "Jan", trips: 42 },
  { month: "Feb", trips: 58 },
  { month: "Mar", trips: 73 },
  { month: "Apr", trips: 91 },
  { month: "May", trips: 120 },
];

const RECENT_USERS = [
  { id: "u1", name: "Traveloop User", email: "user@traveloop.com", joinedAt: "2026-05-09T10:30:00", tripsCount: 3, status: "active" as const },
  { id: "u2", name: "Alex Chen", email: "alex@example.com", joinedAt: "2026-05-08T14:20:00", tripsCount: 1, status: "active" as const },
  { id: "u3", name: "Maria Santos", email: "maria@example.com", joinedAt: "2026-05-07T09:15:00", tripsCount: 2, status: "active" as const },
  { id: "u4", name: "Ravi Kumar", email: "ravi@example.com", joinedAt: "2026-05-06T16:45:00", tripsCount: 0, status: "suspended" as const },
  { id: "u5", name: "Tom Harris", email: "tom@example.com", joinedAt: "2026-05-05T11:00:00", tripsCount: 5, status: "active" as const },
];

const RECENT_TRIPS_ADMIN = [
  { id: "t1", title: "Southeast Asia Adventure", author: "Traveloop User", createdAt: "2026-05-09", status: "PLANNED", privacy: "PUBLIC" },
  { id: "t2", title: "Japan Spring 2026", author: "Alex Chen", createdAt: "2026-05-08", status: "DRAFT", privacy: "PRIVATE" },
  { id: "t3", title: "European Summer Road Trip", author: "Maria Santos", createdAt: "2026-05-07", status: "PLANNED", privacy: "PUBLIC" },
];

/* ─── PAGE ─────────────────────────────────────────────────── */

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<"users" | "trips">("users");
  const [userSearch, setUserSearch] = useState("");

  const filteredUsers = userSearch.trim()
    ? RECENT_USERS.filter((u) => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))
    : RECENT_USERS;

  return (
    <div className="min-h-dvh bg-sand-50">
      <header className="sticky top-0 z-40 bg-sand-50/80 backdrop-blur-md border-b border-sand-200/60">
        <div className="mx-auto max-w-6xl flex items-center gap-4 px-5 py-3.5">
          <Link href="/dashboard" className="p-2 -ml-2 rounded-lg hover:bg-sand-100 text-sand-600" aria-label="Back"><ArrowLeft size={20} /></Link>
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-amber-gold" />
            <h1 className="text-lg font-semibold text-sand-900">Admin Dashboard</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center shrink-0`}><s.icon size={18} /></div>
              <div>
                <p className="text-xs text-sand-400">{s.label}</p>
                <p className="text-lg font-bold text-sand-900">{s.value}</p>
              </div>
              <span className="ml-auto text-xs font-medium text-teal">{s.change}</span>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-sand-900 mb-4 flex items-center gap-2"><TrendingUp size={14} className="text-sand-400" /> Weekly Sign-ups</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={WEEKLY_SIGNUPS}>
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#B5A898" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#B5A898" />
                  <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid #E8E2D8", fontSize: "0.8125rem" }} />
                  <Bar dataKey="count" name="Sign-ups" fill="#E8A020" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-sand-900 mb-4 flex items-center gap-2"><CalendarDays size={14} className="text-sand-400" /> Trips Created (Monthly)</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MONTHLY_TRIPS}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#B5A898" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#B5A898" />
                  <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid #E8E2D8", fontSize: "0.8125rem" }} />
                  <Line type="monotone" dataKey="trips" stroke="#2C6E6A" strokeWidth={2} dot={{ r: 4, fill: "#2C6E6A" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-sand-200 pb-0.5" role="tablist">
          <button role="tab" aria-selected={tab === "users"} onClick={() => setTab("users")} className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-0.5 ${tab === "users" ? "border-amber-gold text-sand-900" : "border-transparent text-sand-400 hover:text-sand-600"}`}>
            <Users size={14} className="inline mr-1.5 -mt-0.5" /> Users
          </button>
          <button role="tab" aria-selected={tab === "trips"} onClick={() => setTab("trips")} className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-0.5 ${tab === "trips" ? "border-amber-gold text-sand-900" : "border-transparent text-sand-400 hover:text-sand-600"}`}>
            <CalendarDays size={14} className="inline mr-1.5 -mt-0.5" /> Trips
          </button>
        </div>

        {/* Users Table */}
        {tab === "users" && (
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-sand-100 flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-400" />
                <input type="text" placeholder="Search users…" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="input-field pl-8 text-sm py-2" aria-label="Search users" />
              </div>
              <span className="text-xs text-sand-400 ml-auto">{filteredUsers.length} users</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-sand-50 text-sand-500 text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 text-left font-semibold">User</th>
                    <th className="px-5 py-3 text-left font-semibold">Joined</th>
                    <th className="px-5 py-3 text-center font-semibold">Trips</th>
                    <th className="px-5 py-3 text-center font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-t border-sand-100 hover:bg-sand-50/50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-sand-800">{u.name}</p>
                        <p className="text-xs text-sand-400">{u.email}</p>
                      </td>
                      <td className="px-5 py-3 text-sand-500 text-xs">{dayjs(u.joinedAt).format("MMM D, YYYY")}</td>
                      <td className="px-5 py-3 text-center font-mono text-sand-600">{u.tripsCount}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${u.status === "active" ? "bg-teal/10 text-teal" : "bg-red-danger/10 text-red-danger"}`}>
                          {u.status === "active" ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1.5 rounded hover:bg-sand-100 text-sand-400 hover:text-sand-600" aria-label="View user"><Eye size={14} /></button>
                          <button className="p-1.5 rounded hover:bg-sand-100 text-sand-400 hover:text-amber-gold" aria-label="Suspend user"><Ban size={14} /></button>
                          <button className="p-1.5 rounded hover:bg-sand-100 text-sand-400 hover:text-red-danger" aria-label="Delete user"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Trips Table */}
        {tab === "trips" && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-sand-50 text-sand-500 text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 text-left font-semibold">Trip</th>
                    <th className="px-5 py-3 text-left font-semibold">Author</th>
                    <th className="px-5 py-3 text-center font-semibold">Status</th>
                    <th className="px-5 py-3 text-center font-semibold">Privacy</th>
                    <th className="px-5 py-3 text-right font-semibold">Created</th>
                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_TRIPS_ADMIN.map((t) => (
                    <tr key={t.id} className="border-t border-sand-100 hover:bg-sand-50/50">
                      <td className="px-5 py-3 font-medium text-sand-800">{t.title}</td>
                      <td className="px-5 py-3 text-sand-500">{t.author}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${t.status === "PLANNED" ? "bg-teal/10 text-teal" : "bg-sand-200/60 text-sand-600"}`}>
                          {t.status === "PLANNED" ? "Planned" : "Draft"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center text-xs text-sand-500">{t.privacy}</td>
                      <td className="px-5 py-3 text-right text-xs text-sand-400">{dayjs(t.createdAt).format("MMM D")}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1.5 rounded hover:bg-sand-100 text-sand-400 hover:text-sand-600" aria-label="View trip"><Eye size={14} /></button>
                          <button className="p-1.5 rounded hover:bg-sand-100 text-sand-400 hover:text-red-danger" aria-label="Delete trip"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
