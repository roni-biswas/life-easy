"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Apni chaile ekhane error-ti log korte paren (e.g., Sentry ba basic console)
    console.error("Runtime Error:", error);
  }, [error]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 max-w-md w-full space-y-6">
        {/* Animated Icon */}
        <div className="flex justify-center">
          <div className="bg-red-100 p-4 rounded-full">
            <AlertTriangle className="h-12 w-12 text-red-600 animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">
            Oops! Something went wrong
          </h1>
          <p className="text-slate-500 text-sm">
            The page failed to load. Please try a quick refresh or return to the
            dashboard.
          </p>
        </div>

        {/* Error Details (Optional - Developer-er jonno) */}
        {process.env.NODE_ENV === "development" && (
          <div className="bg-slate-100 p-3 rounded text-left overflow-auto max-h-32">
            <code className="text-[10px] text-red-500">{error.message}</code>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            onClick={() => reset()}
            className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" /> Try Again
          </Button>

          <Button variant="outline" asChild className="w-full border-slate-300">
            <Link
              href="/user"
              className="flex items-center justify-center gap-2"
            >
              <Home className="h-4 w-4" /> Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>

      <p className="mt-8 text-xs text-slate-400 font-medium uppercase tracking-widest">
        devroni Financial System
      </p>
    </div>
  );
}
