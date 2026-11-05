"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { formatAmount } from "@/lib/currency";
import { sanitizeText } from "@/lib/sanitize";
import { mockRequest } from "@/lib/mock";
import { toast } from "sonner";
import { PrivacyToggle } from "./privacy-toggle";
import {
  Send,
  CreditCard,
  Shield,
  RefreshCw,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function WealthOverview() {
  const user = useStore((s) => s.user);
  const transactions = useStore((s) => s.transactions);
  const privacyMode = useStore((s) => s.privacyMode);
  const [isSyncing, setIsSyncing] = useState(false);

  // Compute live inflow and outflow from transactions
  const totalInflow = transactions
    .filter((t) => t.direction === "in")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOutflow = transactions
    .filter((t) => t.direction === "out")
    .reduce((sum, t) => sum + t.amount, 0);

  const handleSyncLedger = async () => {
    setIsSyncing(true);
    try {
      await mockRequest({ syncedAt: new Date().toISOString() }, 650);
      toast.success("Ledger synced", {
        description: "Balances, exchange rates, and transaction activity are up to date.",
      });
    } catch {
      toast.error("Sync failed", {
        description: "Unable to refresh ledger from the network.",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const displayName = sanitizeText(user.name);

  return (
    <section className="flex flex-col gap-4">
      {/* Top Welcome & Discretion Bar */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Total Net Worth
          </span>
          <p className="text-sm font-medium text-foreground">
            Welcome back, {displayName}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleSyncLedger}
            disabled={isSyncing}
            aria-label="Refresh financial balances"
            title="Sync ledger"
            className="flex size-7 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw className={cn("size-3.5", isSyncing && "animate-spin text-gold")} />
          </button>
          <PrivacyToggle variant="pill" />
        </div>
      </div>

      {/* Main Balance Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xs">
        {/* Subtle accent highlight in top right */}
        <div className="pointer-events-none absolute -right-12 -top-12 size-36 rounded-full bg-gold/5 blur-2xl" />

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {user.currency} Account
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-gold/20 bg-gold/10 px-2 py-0.5 text-[11px] font-medium text-gold">
              <TrendingUp className="size-3" />
              +4.2% this month
            </span>
          </div>

          {/* Primary Wealth Metric */}
          <div className="py-1">
            <span
              className={cn(
                "font-heading text-3xl font-semibold tracking-tight text-foreground transition-all duration-300",
                privacyMode && "blur-md select-none"
              )}
            >
              {formatAmount(user.balance, user.currency)}
            </span>
          </div>

          {/* Monthly Inflow & Outflow pill stats */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
            <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-2">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-background border border-border text-foreground">
                <ArrowDownLeft className="size-3.5 text-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-medium text-muted-foreground leading-tight">
                  Income (30d)
                </p>
                <p
                  className={cn(
                    "text-xs font-semibold text-foreground truncate transition-all duration-300",
                    privacyMode && "blur-xs select-none"
                  )}
                >
                  +{formatAmount(totalInflow, user.currency)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-2">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-background border border-border text-muted-foreground">
                <ArrowUpRight className="size-3.5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-medium text-muted-foreground leading-tight">
                  Spent (30d)
                </p>
                <p
                  className={cn(
                    "text-xs font-semibold text-foreground truncate transition-all duration-300",
                    privacyMode && "blur-xs select-none"
                  )}
                >
                  -{formatAmount(totalOutflow, user.currency)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Dock */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Link
            href="/transfers"
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-background/80 py-2.5 px-2 text-center transition-all hover:bg-muted/50 hover:border-gold/30 active:scale-[0.98]"
          >
            <div className="flex size-8 items-center justify-center rounded-full bg-gold/10 text-gold border border-gold/20">
              <Send className="size-4" />
            </div>
            <span className="text-xs font-medium text-foreground">Send</span>
          </Link>

          <Link
            href="/cards"
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-background/80 py-2.5 px-2 text-center transition-all hover:bg-muted/50 hover:border-gold/30 active:scale-[0.98]"
          >
            <div className="flex size-8 items-center justify-center rounded-full bg-muted text-foreground border border-border">
              <CreditCard className="size-4" />
            </div>
            <span className="text-xs font-medium text-foreground">Cards</span>
          </Link>

          <Link
            href="/security"
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-background/80 py-2.5 px-2 text-center transition-all hover:bg-muted/50 hover:border-gold/30 active:scale-[0.98]"
          >
            <div className="flex size-8 items-center justify-center rounded-full bg-muted text-foreground border border-border">
              <Shield className="size-4" />
            </div>
            <span className="text-xs font-medium text-foreground">Security</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
