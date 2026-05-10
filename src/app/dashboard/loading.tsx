import { Loader2, MapPin } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="min-h-dvh bg-sand-50">
      <header className="bg-white border-b border-sand-200/60 px-5 py-3.5">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-amber-gold" />
            <span className="text-lg font-bold text-sand-900">Travel<span className="text-amber-gold">oop</span></span>
          </div>
          <div className="w-8 h-8 rounded-full bg-sand-200 animate-pulse" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 space-y-8">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-sand-200 rounded-lg animate-pulse" />
          <div className="h-4 w-48 bg-sand-200 rounded-lg animate-pulse" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-white border border-sand-200 rounded-xl animate-pulse" />
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-6">
            <div className="h-64 bg-white border border-sand-200 rounded-xl animate-pulse" />
            <div className="h-64 bg-white border border-sand-200 rounded-xl animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-white border border-sand-200 rounded-xl animate-pulse" />
            <div className="h-64 bg-white border border-sand-200 rounded-xl animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  );
}
