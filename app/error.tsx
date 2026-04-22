"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw, Home, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("System Error:", error);
  }, [error]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#09090b] p-6 text-center transition-colors duration-300">
      <div className="bg-white dark:bg-zinc-950 p-8 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 max-w-md w-full space-y-6 relative overflow-hidden">
        {/* Subtle Background Glow for Dark Mode */}
        <div className="absolute -top-24 -right-24 h-48 w-48 bg-red-500/10 blur-[100px] rounded-full" />

        {/* Animated Icon Section */}
        <div className="flex justify-center">
          <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full ring-8 ring-red-50 dark:ring-red-900/10">
            <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-500 animate-pulse" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
            Oops! System Error
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 text-sm leading-relaxed">
            Something went wrong while processing the data. Please try again or
            head back to safety.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-medium h-11 transition-all active:scale-[0.98]"
          >
            <RefreshCcw className="h-4 w-4 mr-2" /> Try Again
          </Button>

          <Button
            variant="outline"
            asChild
            className="w-full h-11 border-slate-200 dark:border-zinc-800 dark:hover:bg-zinc-900 dark:text-zinc-400 transition-all active:scale-[0.98]"
          >
            <Link
              href="/user"
              className="flex items-center justify-center gap-2"
            >
              <Home className="h-4 w-4" /> Return Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Footer Logo/Branding */}
      <div className="mt-10 flex flex-col items-center gap-2">
        <div className="h-px w-12 bg-slate-300 dark:bg-zinc-800" />
        <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-[0.3em]">
          devroni Financials
        </p>
      </div>
    </div>
  );
}
