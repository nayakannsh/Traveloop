"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { 
  ArrowRight, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Share2, 
  ArrowUpRight,
  Wallet,
  Shield,
} from "lucide-react";
import Logo from "@/components/common/Logo";

export default function LandingPage() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.from(".hero-headline > *", { 
      y: 60, 
      opacity: 0, 
      duration: 1.1, 
      stagger: 0.12 
    })
    .from(".hero-sub", { 
      y: 30, 
      opacity: 0, 
      duration: 0.8 
    }, "-=0.6")
    .from(".hero-cta", { 
      y: 20, 
      opacity: 0, 
      duration: 0.6 
    }, "-=0.4")
    .from(".hero-visual", { 
      scale: 0.92, 
      opacity: 0, 
      duration: 1.4 
    }, "-=1.2")
    .from(".float-card", {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15
    }, "-=0.8");
  }, { scope: containerRef });

  return (
    <div ref={containerRef as any} className="selection:bg-emerald selection:text-white grain-overlay">
      
      {/* ─── HERO SECTION — Full-Width Cinematic ─────────────────── */}
      <section className="relative min-h-[100dvh] overflow-hidden">
        {/* Full-width Background Image */}
        <img 
          src="/hero-dashboard.png" 
          alt="Discover the world — travel destinations and planning interface" 
          className="hero-visual absolute inset-0 w-full h-full object-cover object-center"
        />
        
        {/* Gradient overlays for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-dark/90 via-emerald-dark/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-dark/40 via-transparent to-emerald-dark/20" />
        
        {/* Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-6 pt-36 pb-28 lg:pt-44 lg:pb-36 min-h-[100dvh] flex items-center">
          <div className="max-w-2xl hero-headline">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/80 text-[11px] font-bold uppercase tracking-widest mb-8">
              <Sparkles size={13} className="text-gold-light" /> Smart Travel Planning
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-[5rem] xl:text-[5.5rem] font-serif text-white leading-[1.06] mb-8">
              Discover the<br />
              <span className="italic text-emerald-muted">world,</span> <span className="text-gold-light">plan</span><br />
              your journey.
            </h1>
            
            <p className="hero-sub text-lg lg:text-xl text-white/70 leading-relaxed max-w-lg mb-12">
              Traveloop combines editorial design with intelligent tools to help you build, budget, and share stunning travel itineraries—effortlessly.
            </p>
            
            <div className="hero-cta flex flex-col sm:flex-row items-start gap-4">
              <Link href="/auth/signup" className="bg-white text-emerald-dark font-bold py-4 px-10 rounded-full text-base hover:bg-cream-100 hover:shadow-2xl hover:scale-[1.02] transition-all inline-flex items-center gap-2.5">
                Start Planning <ArrowRight size={18} />
              </Link>
              <Link href="/explore" className="glass-surface text-white font-semibold text-sm flex items-center gap-2 py-4 px-6 rounded-full hover:bg-white/20 transition-all">
                Explore Trips <ArrowUpRight size={16} />
              </Link>
            </div>

            {/* Stat Badges — inline below CTA */}
            <div className="flex items-center gap-6 mt-14 pt-8 border-t border-white/10">
              <div className="float-card">
                <p className="text-2xl font-bold text-white">200+</p>
                <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Destinations</p>
              </div>
              <div className="w-px h-8 bg-white/15" />
              <div className="float-card">
                <p className="text-2xl font-bold text-white">35K+</p>
                <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Travelers</p>
              </div>
              <div className="w-px h-8 bg-white/15" />
              <div className="float-card">
                <p className="text-2xl font-bold text-white">4.9</p>
                <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Rating</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave Transition */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80V40C240 0 480 0 720 20C960 40 1200 60 1440 40V80H0Z" fill="var(--color-cream-50)" />
          </svg>
        </div>
      </section>

      {/* ─── EDITORIAL DESTINATIONS ──────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-xl">
            <span className="text-emerald font-bold text-xs uppercase tracking-[0.2em]">Inspiration</span>
            <h2 className="text-4xl md:text-5xl font-serif text-cream-900 mt-3 leading-tight">Featured Collections</h2>
          </div>
          <Link href="/explore" className="flex items-center gap-2 text-sm font-bold text-cream-600 hover:text-emerald transition-colors group">
            View all destinations <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Large Feature — Asymmetric */}
          <div className="md:col-span-7 space-y-5">
            <div className="relative rounded-[1.75rem] overflow-hidden aspect-[4/3] shadow-editorial group cursor-pointer">
              <img 
                src="/tokyo-featured.avif" 
                alt="Tokyo" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cream-900/50 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <span className="inline-flex items-center gap-1.5 text-white/70 text-[10px] font-bold uppercase tracking-[0.15em]"><MapPin size={10} /> Metropolis</span>
                <h3 className="text-3xl font-serif text-white mt-2">Tokyo: The Neon Dream</h3>
              </div>
              {/* Hover overlay card */}
              <div className="absolute top-6 right-6 glass-surface rounded-2xl px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-xs font-bold text-cream-800">7–14 Days</p>
                <p className="text-[10px] text-cream-500">From $1,200</p>
              </div>
            </div>
            <p className="text-sm text-cream-500 max-w-lg leading-relaxed pl-1">
              Experience the perfect blend of ancient tradition and futuristic innovation in Japan&apos;s vibrant capital.
            </p>
          </div>

          {/* Side Features — Stacked */}
          <div className="md:col-span-5 flex flex-col gap-8">
            <div className="group cursor-pointer">
              <div className="relative rounded-[1.75rem] overflow-hidden aspect-video shadow-editorial mb-4">
                <img 
                  src="/paris-featured.webp" 
                  alt="Paris" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-cream-900/10 group-hover:bg-transparent transition-colors" />
              </div>
              <h4 className="text-xl font-serif text-cream-900 group-hover:text-emerald transition-colors">Parisian Elegance: A Local&apos;s Guide</h4>
              <p className="text-sm text-cream-500 mt-2">Beyond the Eiffel Tower—discover hidden cafes and secret gardens in the city of light.</p>
            </div>

            <div className="group cursor-pointer">
              <div className="relative rounded-[1.75rem] overflow-hidden aspect-video shadow-editorial mb-4">
                <img 
                  src="/swiss-featured.jpeg" 
                  alt="Switzerland" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-cream-900/10 group-hover:bg-transparent transition-colors" />
              </div>
              <h4 className="text-xl font-serif text-cream-900 group-hover:text-emerald transition-colors">Alpine Serenity: Swiss Retreats</h4>
              <p className="text-sm text-cream-500 mt-2">Pristine lakes, snow-capped peaks, and the world&apos;s most scenic train journeys.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BENEFITS SECTION — Dark Emerald ──────────────────── */}
      <section className="bg-emerald-dark py-28 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-light/10 rounded-full blur-[150px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/8 rounded-full blur-[120px] -ml-32 -mb-32" />
        
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-emerald-muted font-bold text-xs uppercase tracking-[0.2em]">Why Traveloop</span>
            <h2 className="text-4xl md:text-5xl font-serif text-white mt-5 mb-6">Designed for the <span className="italic text-emerald-muted">modern</span> traveler.</h2>
            <p className="text-white/50 text-lg">We&apos;ve reimagined travel planning as a beautiful, collaborative experience.</p>
          </div>

          {/* 2×2 Grid — 4 cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 features-grid">
            {[
              { icon: Sparkles, color: "bg-emerald-light/20 text-emerald-muted", title: "AI-Infused Magic", desc: "Our intelligence engine learns your travel style and suggests optimized routes, hidden gems, and local favorites." },
              { icon: Calendar, color: "bg-gold/20 text-gold-light", title: "Visual Itineraries", desc: "Build day-wise plans that look as good as they feel. Drag, drop, and manage budgets." },
              { icon: Wallet, color: "bg-coral/20 text-coral", title: "Budget Tracking", desc: "Set budgets per category, track expenses in real time, and export invoices." },
              { icon: Share2, color: "bg-blue-info/20 text-white/80", title: "Easy Sharing", desc: "Generate a beautiful public link for your trip. Share with friends or the community." },
              { icon: Shield, color: "bg-emerald-muted/20 text-emerald-muted", title: "Secure & Private", desc: "Your travel data is encrypted and stored securely. Share only what you want." },
            ].map((f) => (
              <div key={f.title} className="feature-card space-y-4 p-6 rounded-2xl bg-white/[0.08] border border-white/[0.12] hover:bg-white/[0.14] hover:border-white/[0.2] transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <f.icon size={22} />
                </div>
                <h3 className="text-base font-bold text-white leading-snug">{f.title}</h3>
                <p className="text-white/50 text-[13px] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PUBLIC FEED / SOCIAL ──────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-xl">
            <span className="text-emerald font-bold text-xs uppercase tracking-[0.2em]">Community</span>
            <h2 className="text-4xl md:text-5xl font-serif text-cream-900 mt-3">Latest from the Loop</h2>
            <p className="text-cream-500 mt-4 text-base">Discover how others are traveling and copy their itineraries with one click.</p>
          </div>
          <Link href="/explore" className="btn-secondary py-3 px-8 text-sm whitespace-nowrap">Browse Public Trips</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "European Summer Road Trip", cities: 5, days: 14, author: "Maria S.", budget: "$1,450", rating: "4.9", img: "/european-summer.jpeg" },
            { title: "Southeast Asia Explorer", cities: 4, days: 21, author: "Arjun K.", budget: "$980", rating: "4.8", img: "/southeast-asia.jpeg" },
            { title: "Japan Golden Route", cities: 3, days: 10, author: "Yuki T.", budget: "$2,100", rating: "5.0", img: "/golden-route.jpeg" },
            { title: "Morocco Discovery", cities: 4, days: 12, author: "Elena R.", budget: "$1,200", rating: "4.7", img: "/morocco.jpeg" },
          ].map((trip, i) => (
            <div key={i} className="card p-4 hover:-translate-y-1 transition-all group cursor-pointer">
              <div className="relative rounded-2xl overflow-hidden aspect-square mb-4 bg-cream-200">
                <img 
                  src={trip.img}
                  alt={trip.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 glass-surface px-2.5 py-1 rounded-full text-[10px] font-bold text-cream-900">
                  {trip.rating} ★
                </div>
              </div>
              <h5 className="font-bold text-cream-900 line-clamp-1">{trip.title}</h5>
              <div className="flex items-center gap-2 mt-2 text-xs text-cream-500">
                <MapPin size={12} /> {trip.cities} cities • {trip.days} days
              </div>
              <div className="mt-4 pt-4 border-t border-cream-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-cream-400 uppercase tracking-wider">By {trip.author}</span>
                <span className="text-emerald text-xs font-bold">{trip.budget}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FINAL CTA ───────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 pb-32">
        <div className="bg-emerald rounded-[2.5rem] p-12 md:p-24 text-center relative overflow-hidden">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-[60px]" />
           <div className="absolute bottom-0 right-0 w-60 h-60 bg-gold/10 rounded-full blur-[80px]" />
           <div className="relative z-10 space-y-8">
             <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif text-white leading-tight">
               Your next great <br />
               <span className="italic text-emerald-muted">adventure</span> starts here.
             </h2>
             <p className="text-white/70 text-lg max-w-xl mx-auto">
               Join 50,000+ travelers planning their dream trips with the most beautiful travel tool ever built.
             </p>
             <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
               <Link href="/auth/signup" className="bg-white text-emerald-dark font-bold py-4 px-12 rounded-full text-base hover:bg-cream-100 hover:shadow-xl transition-all inline-flex items-center gap-2">
                  Create Free Account
               </Link>
               <Link href="/explore" className="text-sm font-bold text-white/70 hover:text-white flex items-center gap-2 px-6 py-4 transition-colors">
                  Explore Public Trips <ArrowRight size={16} />
               </Link>
             </div>
           </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────── */}
      <footer className="border-t border-cream-200 py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-2 md:grid-cols-12 gap-12 text-left">
          <div className="col-span-2 md:col-span-4 space-y-6">
            <Logo />
            <p className="text-cream-500 text-sm leading-relaxed max-w-xs">
              Redefining travel planning through beautiful design and artificial intelligence. 
              Built for travelers, by travelers.
            </p>
          </div>
          
          <div className="md:col-span-2 space-y-4">
            <h6 className="text-xs font-bold text-cream-900 uppercase tracking-[0.15em]">Platform</h6>
            <ul className="space-y-2.5">
              {["Explore", "AI Assistant", "Pricing", "Public Feed"].map(link => (
                <li key={link}><Link href="#" className="text-sm text-cream-500 hover:text-emerald transition-colors">{link}</Link></li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2 space-y-4">
            <h6 className="text-xs font-bold text-cream-900 uppercase tracking-[0.15em]">Company</h6>
            <ul className="space-y-2.5">
              {["About", "Journal", "Careers", "Support"].map(link => (
                <li key={link}><Link href="#" className="text-sm text-cream-500 hover:text-emerald transition-colors">{link}</Link></li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4 space-y-4">
            <h6 className="text-xs font-bold text-cream-900 uppercase tracking-[0.15em]">Stay Inspired</h6>
            <p className="text-sm text-cream-500">Subscribe to our editorial newsletter for curated travel guides.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="email@address.com" 
                className="flex-1 bg-cream-50 border border-cream-200 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/10 transition-all" 
                suppressHydrationWarning
              />
              <button 
                className="bg-emerald text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-emerald-dark transition-colors"
                suppressHydrationWarning
              >
                Join
              </button>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-6 mt-20 pt-8 border-t border-cream-100 flex flex-col md:flex-row justify-between gap-4 text-[10px] font-bold text-cream-400 uppercase tracking-[0.2em]">
          <p>© 2026 Traveloop Inc. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-cream-900 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-cream-900 transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-cream-900 transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
