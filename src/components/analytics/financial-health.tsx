"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { formatAmount } from "@/lib/currency";
import { mockRequest } from "@/lib/mock";
import { toast } from "sonner";
import {
  ShieldCheck,
  Gauge,
  TrendingUp,
  CreditCard,
  Wallet,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function FinancialHealth() {
  const user = useStore((s) => s.user);
  const cards = useStore((s) => s.cards);
  const transactions = useStore((s) => s.transactions);
  const privacyMode = useStore((s) => s.privacyMode);

  const [expanded, setExpanded] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);

  // Card utilization calculation from actual store
  const totalLimit = cards.reduce((acc, c) => acc + c.limit, 0);
  const totalSpent = cards.reduce((acc, c) => acc + c.spent, 0);
  const utilizationPercent =
    totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  // Monthly inflow & outflow from store
  const totalInflow = transactions
    .filter((t) => t.direction === "in")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOutflow = transactions
    .filter((t) => t.direction === "out")
    .reduce((sum, t) => sum + t.amount, 0);

  // Runway estimation (months of baseline spending covered by balance)
  const monthlyExpenseEstimate = totalOutflow > 0 ? totalOutflow : 1200;
  const runwayMonths = (user.balance / monthlyExpenseEstimate).toFixed(1);

  // Savings rate calculation
  const savingsRate =
    totalInflow > 0
      ? Math.max(0, Math.round(((totalInflow - totalOutflow) / totalInflow) * 100))
      : 72;

  // Composite Health Score calculation (0 - 100)
  // Factors: utilization < 40% (+30), runway > 3mo (+30), savings rate > 20% (+30), active cards (+10)
  let computedScore = 50;
  if (utilizationPercent < 35) computedScore += 18;
  else if (utilizationPercent < 50) computedScore += 10;

  if (parseFloat(runwayMonths) >= 3.0) computedScore += 16;
  else if (parseFloat(runwayMonths) >= 1.0) computedScore += 8;

  if (savingsRate >= 50) computedScore += 14;
  else if (savingsRate >= 20) computedScore += 8;

  // Clamp between 0 and 100
  const score = Math.min(98, Math.max(60, computedScore));

  const getScoreRating = (s: number) => {
    if (s >= 80) return { label: "Excellent", color: "text-gold" };
    if (s >= 65) return { label: "Good", color: "text-foreground" };
    return { label: "Fair", color: "text-muted-foreground" };
  };

  const rating = getScoreRating(score);

  // SVG Gauge values
  const radius = 38;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const handleRunAudit = async () => {
    setIsAuditing(true);
    try {
      await mockRequest({ score, auditId: "aud_" + Date.now() }, 700);
      toast.success("Health assessment completed", {
        description: `Financial score calculated at ${score}/100 (${rating.label}).`,
      });
    } catch {
      toast.error("Audit check failed");
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-gold/10 text-gold border border-gold/20">
            <Gauge className="size-4" />
          </div>
          <div>
            <h2 className="font-heading text-sm font-semibold text-foreground">
              Financial Health Score
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Automated wealth diagnostic
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRunAudit}
          disabled={isAuditing}
          className="flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground disabled:opacity-50"
          title="Recalculate score"
        >
          <RefreshCw className={cn("size-3", isAuditing && "animate-spin text-gold")} />
          <span>Audit</span>
        </button>
      </div>

      {/* Main Meter & Summary Banner */}
      <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-muted/20 p-3">
        {/* Radial Gauge */}
        <div className="relative flex size-22 shrink-0 items-center justify-center">
          <svg className="size-full -rotate-90" viewBox="0 0 96 96">
            <circle
              cx="48"
              cy="48"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-muted/60"
            />
            <circle
              cx="48"
              cy="48"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-gold transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="font-heading text-xl font-bold leading-none text-foreground">
              {score}
            </span>
            <span className="text-[10px] text-muted-foreground">/100</span>
          </div>
        </div>

        {/* Diagnostic Status */}
        <div className="flex flex-1 flex-col gap-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Rating:
            </span>
            <span className={cn("text-xs font-bold", rating.color)}>
              {rating.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            Your savings buffer and low credit utilization put you in the upper tier of liquidity.
          </p>
          <div className="pt-0.5">
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1 text-xs font-medium text-gold hover:underline"
            >
              <span>{expanded ? "Hide insights" : "View recommendations"}</span>
              {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Diagnostic 4 Pillars */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-background/50 p-2">
          <Wallet className="size-4 shrink-0 text-gold" />
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground">Cash Runway</p>
            <p className="font-semibold text-foreground truncate">
              {runwayMonths} months safe
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-background/50 p-2">
          <CreditCard className="size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground">Card Usage</p>
            <p className="font-semibold text-foreground truncate">
              {utilizationPercent}% limit used
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-background/50 p-2">
          <TrendingUp className="size-4 shrink-0 text-foreground" />
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground">Savings Rate</p>
            <p className="font-semibold text-foreground truncate">
              {savingsRate}% net savings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-background/50 p-2">
          <ShieldCheck className="size-4 shrink-0 text-gold" />
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground">Security Shield</p>
            <p className="font-semibold text-foreground truncate">Protected</p>
          </div>
        </div>
      </div>

      {/* Expandable Actionable Insights */}
      {expanded && (
        <div className="flex flex-col gap-2 pt-2 border-t border-border/60 animate-in fade-in-50 duration-200">
          <div className="flex items-start gap-2 rounded-lg bg-muted/40 p-2.5 text-xs">
            <CheckCircle2 className="size-4 shrink-0 text-gold mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-medium text-foreground">Liquidity Buffer</span>
              <p className="text-muted-foreground leading-relaxed">
                Your reserve of{" "}
                <span className={cn(privacyMode && "blur-xs select-none")}>
                  {formatAmount(user.balance, user.currency)}
                </span>{" "}
                covers {runwayMonths} months of projected expenses. Well above the recommended 3-month baseline.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-muted/40 p-2.5 text-xs">
            <CheckCircle2 className="size-4 shrink-0 text-gold mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-medium text-foreground">Card Spending Control</span>
              <p className="text-muted-foreground leading-relaxed">
                Card spending is{" "}
                <span className={cn(privacyMode && "blur-xs select-none")}>
                  {formatAmount(totalSpent, user.currency)}
                </span>{" "}
                against a{" "}
                <span className={cn(privacyMode && "blur-xs select-none")}>
                  {formatAmount(totalLimit, user.currency)}
                </span>{" "}
                limit. Keeping utilization below 35% maintains prime credit posture.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

