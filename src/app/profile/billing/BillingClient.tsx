"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  CreditCard, 
  Download, 
  Printer, 
  FileText, 
  CheckCircle2, 
  Clock,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";

const INVOICES = [
  { id: "INV-2024-001", date: "2024-05-01", amount: "$12.00", status: "Paid", plan: "Pro Monthly" },
  { id: "INV-2024-002", date: "2024-04-01", amount: "$12.00", status: "Paid", plan: "Pro Monthly" },
  { id: "INV-2024-003", date: "2024-03-01", amount: "$12.00", status: "Paid", plan: "Pro Monthly" },
];

export default function BillingClient({ user }: { user: any }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = (id: string) => {
    toast.success(`Downloading invoice ${id}...`);
    // Mock download logic
    const data = `Invoice: ${id}\nUser: ${user.name}\nAmount: $12.00\nStatus: Paid`;
    const blob = new Blob([data], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${id}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-dvh bg-sand-50 pb-12">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-sand-50/80 backdrop-blur-md border-b border-sand-200/60 print:hidden">
        <div className="mx-auto max-w-3xl flex items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            <Link href="/profile" className="p-2 -ml-2 rounded-lg hover:bg-sand-100 text-sand-600" aria-label="Back">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-lg font-semibold text-sand-900">Billing & Subscription</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-8 space-y-8">
        {/* ─── CURRENT PLAN ────────────────────────────────── */}
        <section className="card p-6 border-l-4 border-l-amber-gold print:border-none print:shadow-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-amber-gold font-bold text-xs uppercase tracking-wider mb-1">
                <CheckCircle2 size={14} /> Current Plan
              </div>
              <h2 className="text-2xl font-bold text-sand-900">Traveloop Pro</h2>
              <p className="text-sand-500 text-sm mt-1">Your next billing date is June 1, 2024</p>
            </div>
            <div className="flex items-center gap-3 print:hidden">
              <button 
                onClick={() => toast.error("Please contact support to cancel your plan.")}
                className="btn-secondary text-sm py-2 px-4"
              >
                Cancel Plan
              </button>
              <button 
                onClick={() => toast.success("Redirecting to plan selection...")}
                className="btn-primary text-sm py-2 px-4"
              >
                Upgrade Plan
              </button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-sand-400 uppercase font-semibold">Amount</p>
              <p className="text-lg font-bold text-sand-900">$12.00<span className="text-sm font-normal text-sand-400">/mo</span></p>
            </div>
            <div>
              <p className="text-xs text-sand-400 uppercase font-semibold">Payment Method</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="bg-sand-200 px-1.5 py-0.5 rounded text-[10px] font-bold">VISA</div>
                <p className="text-sm font-medium text-sand-700">•••• 4242</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── BILLING HISTORY ────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-sand-900 flex items-center gap-2">
              <Clock size={16} className="text-sand-400" /> Billing History
            </h3>
            <button 
              onClick={handlePrint}
              className="text-xs font-semibold text-amber-gold hover:text-amber-gold-hover flex items-center gap-1.5 transition-colors print:hidden"
            >
              <Printer size={14} /> Print All Receipts
            </button>
          </div>

          <div className="card overflow-hidden print:border-none print:shadow-none">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-sand-100/50 text-[11px] uppercase tracking-wider text-sand-500 font-bold border-b border-sand-200">
                    <th className="px-6 py-3">Invoice</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right print:hidden">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-100">
                  {INVOICES.map((inv) => (
                    <tr key={inv.id} className="text-sm text-sand-700 hover:bg-sand-50/50 transition-colors group">
                      <td className="px-6 py-4 font-mono text-xs">{inv.id}</td>
                      <td className="px-6 py-4 text-sand-500">{inv.date}</td>
                      <td className="px-6 py-4 font-semibold text-sand-900">{inv.amount}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal/10 text-teal uppercase">
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right print:hidden">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleDownload(inv.id)}
                            className="p-2 rounded-lg hover:bg-sand-200 text-sand-400 hover:text-sand-600 transition-all"
                            title="Download PDF"
                          >
                            <Download size={16} />
                          </button>
                          <button 
                            onClick={() => {
                              toast.success("Opening detailed invoice...");
                              window.print();
                            }}
                            className="p-2 rounded-lg hover:bg-sand-200 text-sand-400 hover:text-sand-600 transition-all"
                            title="Print Invoice"
                          >
                            <FileText size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ─── PAYMENT SETTINGS ───────────────────────────── */}
        <section className="card p-6 space-y-4 print:hidden">
          <h3 className="text-sm font-semibold text-sand-900 flex items-center gap-2">
            <CreditCard size={16} className="text-sand-400" /> Payment Methods
          </h3>
          <button 
            onClick={() => toast.success("Loading payment method editor...")}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-sand-200 hover:bg-sand-50 transition-all group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 rounded bg-sand-900 flex items-center justify-center text-[10px] text-white font-bold tracking-tighter italic">VISA</div>
              <div className="text-left">
                <p className="text-sm font-semibold text-sand-900">Visa ending in 4242</p>
                <p className="text-xs text-sand-400">Expires 12/2026</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-amber-gold group-hover:underline">Edit</span>
          </button>
          <button 
            onClick={() => toast.success("Opening secure card entry...")}
            className="w-full py-3 px-4 rounded-xl border border-dashed border-sand-300 text-sand-500 text-sm font-medium hover:border-sand-400 hover:text-sand-700 transition-all"
          >
            + Add New Payment Method
          </button>
        </section>

        {/* ─── HELP ───────────────────────────────────────── */}
        <div className="text-center pt-4 print:hidden">
          <p className="text-sm text-sand-400">
            Questions about your billing?{" "}
            <button 
              onClick={() => toast.success("Opening support chat...")}
              className="text-amber-gold hover:underline font-medium"
            >
              Contact Support
            </button>
          </p>
        </div>
      </main>

      {/* Print-only CSS */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          .card {
            border: none !important;
            box-shadow: none !important;
          }
          header, .print-hidden {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
