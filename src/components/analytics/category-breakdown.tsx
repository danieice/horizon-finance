"use client";

import { useMemo } from "react";
import { useStore } from "@/store/useStore";
import { formatAmount } from "@/lib/currency";
import type { TxCategory } from "@/types";
import {
  Utensils,
  ShoppingBag,
  Receipt,
  Car,
  ArrowUpRight,
  PieChart,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryMeta {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}

const CATEGORY_MAP: Record<TxCategory, CategoryMeta> = {
  Food: { label: "Food & Dining", icon: Utensils, colorClass: "text-gold bg-gold/10 border-gold/20" },
  Shopping: { label: "Shopping", icon: ShoppingBag, colorClass: "text-foreground bg-muted border-border" },
  Bills: { label: "Bills & Utilities", icon: Receipt, colorClass: "text-foreground bg-muted border-border" },
  Transport: { label: "Transportation", icon: Car, colorClass: "text-muted-foreground bg-muted/60 border-border" },
  Transfer: { label: "Transfers Out", icon: ArrowUpRight, colorClass: "text-gold bg-gold/10 border-gold/20" },
  Income: { label: "Income", icon: HelpCircle, colorClass: "text-foreground bg-muted border-border" },
};

export function CategoryBreakdown() {
  const user = useStore((s) => s.user);
  const transactions = useStore((s) => s.transactions);
  const privacyMode = useStore((s) => s.privacyMode);

  const { breakdown, totalOutflow } = useMemo(() => {
    const outgoing = transactions.filter((t) => t.direction === "out");
    const total = outgoing.reduce((sum, t) => sum + t.amount, 0);

    const map = new Map<TxCategory, { count: number; total: number }>();

    outgoing.forEach((tx) => {
      const existing = map.get(tx.category) || { count: 0, total: 0 };
      map.set(tx.category, {
        count: existing.count + 1,
        total: existing.total + tx.amount,
      });
    });

    const items = Array.from(map.entries())
      .map(([cat, data]) => ({
        category: cat,
        count: data.count,
        amount: data.total,
        percentage: total > 0 ? Math.round((data.total / total) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return { breakdown: items, totalOutflow: total };
  }, [transactions]);

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-muted text-foreground border border-border">
            <PieChart className="size-4" />
          </div>
          <div>
            <h2 className="font-heading text-sm font-semibold text-foreground">
              Spending by Category
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Portfolio expenditure distribution
            </p>
          </div>
        </div>

        <span
          className={cn(
            "text-xs font-semibold text-muted-foreground transition-all duration-300",
            privacyMode && "blur-xs select-none"
          )}
        >
          {formatAmount(totalOutflow, user.currency)} total
        </span>
      </div>

      {/* Proportional Segment Bar */}
      {breakdown.length > 0 && (
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted/60">
          {breakdown.map((item, idx) => (
            <div
              key={item.category}
              style={{ width: `${Math.max(4, item.percentage)}%` }}
              className={cn(
                "h-full transition-all",
                idx === 0
                  ? "bg-gold"
                  : idx === 1
                  ? "bg-foreground/80"
                  : idx === 2
                  ? "bg-muted-foreground/60"
                  : "bg-muted-foreground/30"
              )}
              title={`${item.category}: ${item.percentage}%`}
            />
          ))}
        </div>
      )}

      {/* Category List */}
      <div className="flex flex-col divide-y divide-border/50">
        {breakdown.map((item, idx) => {
          const meta = CATEGORY_MAP[item.category] || {
            label: item.category,
            icon: HelpCircle,
            colorClass: "text-foreground bg-muted border-border",
          };
          const Icon = meta.icon;

          return (
            <div key={item.category} className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg border",
                    meta.colorClass
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {meta.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {item.count} {item.count === 1 ? "transaction" : "transactions"} · {item.percentage}%
                  </p>
                </div>
              </div>

              <div className="text-right pl-2">
                <p
                  className={cn(
                    "text-xs font-semibold text-foreground transition-all duration-300",
                    privacyMode && "blur-xs select-none"
                  )}
                >
                  {formatAmount(item.amount, user.currency)}
                </p>
                <div className="flex items-center justify-end gap-1">
                  <div
                    className={cn(
                      "size-1.5 rounded-full",
                      idx === 0 ? "bg-gold" : "bg-muted-foreground/40"
                    )}
                  />
                  <span className="text-[10px] text-muted-foreground">{item.percentage}%</span>
                </div>
              </div>
            </div>
          );
        })}

        {breakdown.length === 0 && (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No outgoing expenses recorded yet.
          </div>
        )}
      </div>
    </section>
  );
}

