"use client";

import { useStore } from "@/store/useStore";
import { formatAmount } from "@/lib/currency";
import { CreditCard, Flame, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuickStats() {
  const user = useStore((s) => s.user);
  const cards = useStore((s) => s.cards);
  const transactions = useStore((s) => s.transactions);
  const privacyMode = useStore((s) => s.privacyMode);

  const activeCards = cards.filter((c) => c.status === "active").length;
  const outgoings = transactions.filter((t) => t.direction === "out");

  const largestExpense = outgoings.length > 0
    ? Math.max(...outgoings.map((t) => t.amount))
    : 0;

  const totalOut = outgoings.reduce((sum, t) => sum + t.amount, 0);
  const avgDaily = outgoings.length > 0 ? totalOut / 14 : 0;

  return (
    <section className="grid grid-cols-3 gap-2">
      {/* Active Cards Metric */}
      <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-3 shadow-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[10px] font-medium uppercase tracking-wider">
            Cards
          </span>
          <CreditCard className="size-3.5 text-gold" />
        </div>
        <div>
          <p className="font-heading text-base font-semibold text-foreground">
            {activeCards}/{cards.length}
          </p>
          <p className="text-[10px] text-muted-foreground truncate">
            Active in wallet
          </p>
        </div>
      </div>

      {/* Largest Expense */}
      <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-3 shadow-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[10px] font-medium uppercase tracking-wider">
            Top Outflow
          </span>
          <Flame className="size-3.5 text-gold" />
        </div>
        <div>
          <p
            className={cn(
              "font-heading text-base font-semibold text-foreground truncate transition-all duration-300",
              privacyMode && "blur-xs select-none"
            )}
          >
            {formatAmount(largestExpense, user.currency)}
          </p>
          <p className="text-[10px] text-muted-foreground truncate">
            Single largest
          </p>
        </div>
      </div>

      {/* Velocity / Avg Daily */}
      <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-3 shadow-xs">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-[10px] font-medium uppercase tracking-wider">
            Daily Burn
          </span>
          <Activity className="size-3.5 text-foreground" />
        </div>
        <div>
          <p
            className={cn(
              "font-heading text-base font-semibold text-foreground truncate transition-all duration-300",
              privacyMode && "blur-xs select-none"
            )}
          >
            {formatAmount(avgDaily, user.currency)}
          </p>
          <p className="text-[10px] text-muted-foreground truncate">
            Estimated/day
          </p>
        </div>
      </div>
    </section>
  );
}

