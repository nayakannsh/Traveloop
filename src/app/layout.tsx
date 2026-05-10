import type { Metadata } from "next";
import { Sora, DM_Mono, Instrument_Serif } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/common/ThemeProvider";
import Script from "next/script";
import "./globals.css";

const sora = Sora({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Traveloop — Personalized Travel Planning Made Easy",
  description:
    "Plan multi-city trips, manage budgets, build day-wise itineraries, and share stunning travel plans with a single link.",
  keywords: ["travel planner", "itinerary builder", "trip budget", "travel sharing"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${dmMono.variable} ${instrumentSerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head />
      <body className="grain-overlay min-h-full flex flex-col bg-sand-50 text-sand-900 font-sans">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: "0.625rem",
              fontFamily: "var(--font-sans)",
              fontSize: "0.875rem",
            },
          }}
        />
      </body>
    </html>
  );
}
