import { MapPin, Plane, TrendingUp, Sparkles, Compass } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const WORLD_CITIES = [
  { name: "Paris", country: "France", tag: "Romance", budget: "$$$", bestTime: "Apr–Oct" },
  { name: "Tokyo", country: "Japan", tag: "Food & Tech", budget: "$$$", bestTime: "Mar–May" },
  { name: "Bali", country: "Indonesia", tag: "Beaches", budget: "$$", bestTime: "Apr–Sep" },
  { name: "Dubai", country: "UAE", tag: "Luxury", budget: "$$$$", bestTime: "Nov–Mar" },
  { name: "Singapore", country: "Singapore", tag: "Modern City", budget: "$$$", bestTime: "Feb–Apr" },
  { name: "London", country: "UK", tag: "History", budget: "$$$", bestTime: "May–Sep" },
  { name: "Rome", country: "Italy", tag: "Ancient History", budget: "$$$", bestTime: "Apr–Jun" },
  { name: "Barcelona", country: "Spain", tag: "Architecture", budget: "$$", bestTime: "May–Jun" },
  { name: "Istanbul", country: "Turkey", tag: "Culture", budget: "$$", bestTime: "Sep–Nov" },
  { name: "New York", country: "USA", tag: "Skylines", budget: "$$$$", bestTime: "Sep–Nov" },
];

const INDIA_CITIES = [
  { name: "Goa", state: "Goa", tag: "Nightlife & Beaches", budget: "$$", bestTime: "Nov–Feb" },
  { name: "Leh", state: "Ladakh", tag: "Adventure", budget: "$$", bestTime: "Jun–Sep" },
  { name: "Jaipur", state: "Rajasthan", tag: "Heritage", budget: "$", bestTime: "Oct–Mar" },
  { name: "Kochi", state: "Kerala", tag: "Backwaters", budget: "$$", bestTime: "Dec–Feb" },
  { name: "Varanasi", state: "UP", tag: "Spirituality", budget: "$", bestTime: "Nov–Feb" },
  { name: "Srinagar", state: "Kashmir", tag: "Scenic Beauty", budget: "$$", bestTime: "Apr–Oct" },
  { name: "Hampi", state: "Karnataka", tag: "Ancient Ruins", budget: "$", bestTime: "Nov–Feb" },
  { name: "Munnar", state: "Kerala", tag: "Tea Gardens", budget: "$$", bestTime: "Sep–Nov" },
  { name: "Rishikesh", state: "Uttarakhand", tag: "Yoga & River", budget: "$", bestTime: "Mar–May" },
  { name: "Udaipur", state: "Rajasthan", tag: "Lakes & Luxury", budget: "$$$", bestTime: "Oct–Mar" },
];

export default function CityDiscovery() {
  return (
    <div className="space-y-12 py-10">
      {/* World Favorites */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-accent/10 flex items-center justify-center text-indigo-accent">
              <Plane size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-sand-900">Global Favorites</h2>
              <p className="text-sm text-sand-400">Most visited cities across the globe</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {WORLD_CITIES.map((city) => (
            <Link 
              key={city.name} 
              href={`/explore?q=${city.name}`}
              className="card p-4 group cursor-pointer hover:border-indigo-accent/30 transition-all block"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="w-8 h-8 rounded-lg bg-sand-100 flex items-center justify-center text-sand-400 group-hover:bg-indigo-accent group-hover:text-white transition-colors">
                  <MapPin size={16} />
                </div>
                <span className="text-[10px] font-bold text-sand-300 font-mono">{city.budget}</span>
              </div>
              <h3 className="font-bold text-sand-900 group-hover:text-indigo-accent transition-colors">{city.name}</h3>
              <p className="text-xs text-sand-400 mb-2">{city.country}</p>
              <div className="flex flex-wrap gap-1 mt-auto">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sand-100 text-sand-500 font-medium">{city.tag}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal/5 text-teal font-medium">{city.bestTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending in India */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-gold/10 flex items-center justify-center text-amber-gold">
              <TrendingUp size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-sand-900">Trending in India</h2>
              <p className="text-sm text-sand-400">Popular domestic getaways for your next plan</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {INDIA_CITIES.map((city) => (
            <Link 
              key={city.name} 
              href={`/explore?q=${city.name}`}
              className="card p-4 group cursor-pointer hover:border-amber-gold/30 transition-all block"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="w-8 h-8 rounded-lg bg-sand-100 flex items-center justify-center text-sand-400 group-hover:bg-amber-gold group-hover:text-white transition-colors">
                  <Compass size={16} />
                </div>
                <span className="text-[10px] font-bold text-sand-300 font-mono">{city.budget}</span>
              </div>
              <h3 className="font-bold text-sand-900 group-hover:text-amber-gold transition-colors">{city.name}</h3>
              <p className="text-xs text-sand-400 mb-2">{city.state}</p>
              <div className="flex flex-wrap gap-1 mt-auto">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sand-100 text-sand-500 font-medium">{city.tag}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-gold/5 text-amber-gold font-medium">{city.bestTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Inspiration Prompt */}
      <section className="bg-sand-100 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 border border-sand-200">
        <div className="flex-1 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-accent text-white text-[10px] font-bold uppercase tracking-widest">
            <Sparkles size={12} /> AI Travel Assistant
          </div>
          <h2 className="text-2xl font-bold text-sand-900">Can&apos;t decide where to go?</h2>
          <p className="text-sand-500 text-sm leading-relaxed">
            Tell us your preferences (e.g., &quot;Solo beach trip with $1000 budget&quot;) and our AI will suggest the perfect itinerary for you.
          </p>
          <button 
            onClick={() => toast.success("AI Assistant is being initialized...")}
            className="btn-primary py-2 px-6 text-sm"
          >
            Ask Traveloop AI
          </button>
        </div>
        <div className="w-full md:w-64 h-40 bg-sand-200 rounded-xl overflow-hidden relative border border-sand-300">
           <img 
            src="/travelai.jpeg" 
            alt="AI Travel Assistant" 
            className="w-full h-full object-cover"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-sand-900/40 to-transparent" />
        </div>
      </section>
    </div>
  );
}
