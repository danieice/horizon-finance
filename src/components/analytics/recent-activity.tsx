"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { formatAmount } from "@/lib/currency";
import { sanitizeText } from "@/lib/sanitize";
import type { Transaction, TxCategory } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Utensils,
  ShoppingBag,
  Receipt,
  Car,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Tag,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<TxCategory, React.ComponentType<{ className?: string }>> = {
  Food: Utensils,
  Shopping: ShoppingBag,
  Bills: Receipt,
  Transport: Car,
  Transfer: ArrowUpRight,
  Income: ArrowDownLeft,
};

type FilterDirection = "all" | "out" | "in";

export function RecentActivity() {
  const transactions = useStore((s) => s.transactions);
  const privacyMode = useStore((s) => s.privacyMode);

  const [filter, setFilter] = useState<FilterDirection>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const filteredTransactions = useMemo(() => {
    const cleanSearch = sanitizeText(searchQuery).toLowerCase();

    return transactions.filter((tx) => {
      // Direction filter
      if (filter !== "all" && tx.direction !== filter) {
        return false;
      }
      // Search filter
      if (cleanSearch) {
        const titleMatch = tx.title.toLowerCase().includes(cleanSearch);
        const memoMatch = tx.memo.toLowerCase().includes(cleanSearch);
        const catMatch = tx.category.toLowerCase().includes(cleanSearch);
        return titleMatch || memoMatch || catMatch;
      }
      return true;
    });
  }, [transactions, filter, searchQuery]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-sm font-semibold text-foreground">
            Recent Ledger Activity
          </h2>
          <p className="text-[11px] text-muted-foreground">
            Audited financial operations
          </p>
        </div>

        {/* Direction Filter Tabs */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
          {(["all", "out", "in"] as FilterDirection[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors capitalize",
                filter === f
                  ? "bg-background text-foreground shadow-xs border border-border/50"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f === "all" ? "All" : f === "out" ? "Out" : "In"}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by description or memo..."
          className="h-8 w-full rounded-lg border border-input bg-background/50 pl-8 pr-3 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {/* Transaction List */}
      <div className="flex flex-col divide-y divide-border/50">
        {filteredTransactions.map((tx) => {
          const Icon = CATEGORY_ICONS[tx.category] || FileText;
          const isIncome = tx.direction === "in";
          const safeTitle = sanitizeText(tx.title);
          const safeMemo = sanitizeText(tx.memo);

          return (
            <button
              key={tx.id}
              type="button"
              onClick={() => setSelectedTx(tx)}
              className="flex w-full items-center justify-between py-2.5 text-left transition-colors hover:bg-muted/30 rounded-lg px-1.5 -mx-1.5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl border",
                    isIncome
                      ? "border-gold/30 bg-gold/10 text-gold"
                      : "border-border bg-muted/60 text-foreground"
                  )}
                >
                  <Icon className="size-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {safeTitle}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {safeMemo || tx.category} · {formatDate(tx.date)}
                  </p>
                </div>
              </div>

              <div className="text-right pl-2 shrink-0">
                <p
                  className={cn(
                    "text-xs font-bold transition-all duration-300",
                    isIncome ? "text-gold" : "text-foreground",
                    privacyMode && "blur-xs select-none"
                  )}
                >
                  {isIncome ? "+" : "-"}
                  {formatAmount(tx.amount, tx.currency)}
                </p>
                <span className="text-[10px] text-muted-foreground uppercase">
                  {tx.currency}
                </span>
              </div>
            </button>
          );
        })}

        {filteredTransactions.length === 0 && (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No transactions found matching your criteria.
          </div>
        )}
      </div>

      {/* Detailed Transaction Dialog */}
      <Dialog open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
        {selectedTx && (
          <DialogContent className="max-w-[360px] rounded-2xl bg-card border-border p-5">
            <DialogHeader className="items-center text-center">
              <div
                className={cn(
                  "flex size-12 items-center justify-center rounded-2xl border mb-2",
                  selectedTx.direction === "in"
                    ? "border-gold/30 bg-gold/10 text-gold"
                    : "border-border bg-muted text-foreground"
                )}
              >
                {selectedTx.direction === "in" ? (
                  <ArrowDownLeft className="size-6" />
                ) : (
                  <ArrowUpRight className="size-6" />
                )}
              </div>
              <DialogTitle className="text-base font-bold text-foreground">
                {sanitizeText(selectedTx.title)}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Verified on Horizon Settlement Network
              </DialogDescription>
            </DialogHeader>

            {/* Amount Badge */}
            <div className="my-2 rounded-xl bg-muted/40 p-3 text-center border border-border/50">
              <span className="text-[11px] text-muted-foreground uppercase font-medium">
                Settled Amount
              </span>
              <p
                className={cn(
                  "font-heading text-2xl font-bold tracking-tight",
                  selectedTx.direction === "in" ? "text-gold" : "text-foreground",
                  privacyMode && "blur-md select-none"
                )}
              >
                {selectedTx.direction === "in" ? "+" : "-"}
                {formatAmount(selectedTx.amount, selectedTx.currency)}
              </p>
            </div>

            {/* Transaction Metadata Grid */}
            <div className="flex flex-col gap-2 divide-y divide-border/40 text-xs">
              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Tag className="size-3.5" /> Category
                </span>
                <span className="font-medium text-foreground">{selectedTx.category}</span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <FileText className="size-3.5" /> Memo
                </span>
                <span className="font-medium text-foreground text-right max-w-[180px] truncate">
                  {sanitizeText(selectedTx.memo) || "None"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Clock className="size-3.5" /> Timestamp
                </span>
                <span className="font-medium text-foreground">
                  {new Date(selectedTx.date).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-gold" /> Status
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-gold">
                  <CheckCircle2 className="size-3" /> Completed
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted-foreground">Audit Ref</span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {selectedTx.id}-{selectedTx.date.slice(0, 10).replace(/-/g, "")}
                </span>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
}

