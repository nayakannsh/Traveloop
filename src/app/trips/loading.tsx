import { Loader2 } from "lucide-react";

export default function TripsLoading() {
  return (
    <div className="min-h-dvh bg-sand-50 flex flex-col items-center justify-center">
      <Loader2 size={32} className="animate-spin text-amber-gold mb-4" />
      <h2 className="text-lg font-semibold text-sand-900">Loading your trips...</h2>
      <p className="text-sm text-sand-400 mt-2">Getting things ready for your next adventure.</p>
    </div>
  );
}
