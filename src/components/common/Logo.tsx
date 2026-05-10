import Link from "next/link";
import { MapPin } from "lucide-react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "dark" | "light";
}

export default function Logo({ className = "", size = "md", variant = "dark" }: LogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20,
  };

  const textColor = variant === "light" ? "text-white" : "text-cream-900";
  const accentColor = variant === "light" ? "text-emerald-muted" : "text-emerald";
  const iconBg = variant === "light" ? "bg-white/20 backdrop-blur-sm" : "bg-emerald";

  return (
    <Link href="/" className={`flex items-center gap-2.5 group ${className}`} aria-label="Traveloop home">
      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl ${iconBg} text-white group-hover:scale-105 transition-transform`}>
        <MapPin size={iconSizes[size]} strokeWidth={2.5} />
      </span>
      <span className={`${sizeClasses[size]} font-bold tracking-tight ${textColor}`}>
        Travel<span className={accentColor}>oop</span>
      </span>
    </Link>
  );
}
