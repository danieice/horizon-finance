"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { formatAmount } from "@/lib/currency";
import { sanitizeText } from "@/lib/sanitize";
import { mockRequest } from "@/lib/mock";
import type { Transaction, TxCategory } from "@/types";
import { PrivacyToggle } from "./privacy-toggle";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Download,
  Share2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Tag,
  FileText,
  CreditCard,
  Hash,
  Utensils,
  ShoppingBag,
  Receipt,
  Car,
  ArrowUpRight,
  ArrowDownLeft,
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

interface TransactionDetailsProps {
  tx: Transaction;
  onBack: () => void;
}

export function TransactionDetails({ tx, onBack }: TransactionDetailsProps) {
  const privacyMode = useStore((s) => s.privacyMode);
  const [isDownloading, setIsDownloading] = useState(false);

  const isIncome = tx.direction === "in";
  const Icon = CATEGORY_ICONS[tx.category] || FileText;
  const safeTitle = sanitizeText(tx.title);
  const safeMemo = sanitizeText(tx.memo);

  // Formatted date details
  const txDate = new Date(tx.date);
  const formattedFullDate = txDate.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const formattedTime = txDate.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Mock audit signature
  const auditHash = `0x${Array.from(tx.id + tx.date)
    .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 0)
    .toString(16)
    .padStart(8, "0")}e4a91b2c`;

  const handleCopyHash = () => {
    navigator.clipboard?.writeText?.(auditHash);
    toast.success("Audit hash copied", {
      description: "Cryptographic ledger hash copied to clipboard.",
    });
  };

  const handleDownloadReceipt = async () => {
    setIsDownloading(true);
    try {
      await mockRequest({ receiptId: tx.id }, 600);
      toast.success("Receipt downloaded", {
        description: `Statement file Horizon-${tx.id.toUpperCase()}.pdf ready.`,
      });
    } catch {
      toast.error("Download failed");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    toast.success("Share link copied", {
      description: "Transaction verification link copied to clipboard.",
    });
  };

  const handleReport = () => {
    toast.info("Inquiry initiated", {
      description: `Support ticket opened for reference #${tx.id.toUpperCase()}.`,
    });
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in-50 duration-200">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Activity</span>
        </button>

        <PrivacyToggle variant="pill" />
      </div>

      {/* Hero Transaction Card */}
      <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center shadow-xs">
        {/* Category Icon */}
        <div
          className={cn(
            "flex size-14 items-center justify-center rounded-2xl border mb-3",
            isIncome
              ? "border-gold/30 bg-gold/10 text-gold"
              : "border-border bg-muted/60 text-foreground"
          )}
        >
          <Icon className="size-7" />
        </div>

        <h1 className="font-heading text-lg font-bold text-foreground">
          {safeTitle}
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formattedFullDate} · {formattedTime}
        </p>

        {/* Big Amount */}
        <div className="my-3 py-1">
          <span
            className={cn(
              "font-heading text-3xl font-extrabold tracking-tight transition-all duration-300",
              isIncome ? "text-gold" : "text-foreground",
              privacyMode && "blur-md select-none"
            )}
          >
            {isIncome ? "+" : "-"}
            {formatAmount(tx.amount, tx.currency)}
          </span>
          <span className="ml-1 text-xs text-muted-foreground uppercase font-medium">
            {tx.currency}
          </span>
        </div>

        {/* Status Pill */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
          <CheckCircle2 className="size-3.5 text-gold" />
          <span>Settled & Verified</span>
        </div>
      </div>

      {/* Transaction Details Ledger Card */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs">
        <h2 className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Transaction Overview
        </h2>

        <div className="flex flex-col divide-y divide-border/40 text-xs">
          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Tag className="size-3.5" /> Category
            </span>
            <span className="font-medium text-foreground">{tx.category}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <FileText className="size-3.5" /> Memo / Note
            </span>
            <span className="font-medium text-foreground text-right max-w-[200px] truncate">
              {safeMemo || "No note attached"}
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <CreditCard className="size-3.5" /> Payment Method
            </span>
            <span className="font-medium text-foreground">
              {tx.category === "Transfer"
                ? "Bank transfer"
                : isIncome
                  ? "Bank deposit"
                  : "Horizon Metal Card"}
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Clock className="size-3.5" /> Transaction Type
            </span>
            <span className="font-medium text-foreground">
              {isIncome
                ? "Inward Deposit"
                : tx.category === "Transfer"
                  ? "Outgoing Transfer"
                  : "Direct Card Outflow"}
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground">Network Fee</span>
            <span className="font-medium text-gold">
              Zero Fee ({formatAmount(0, tx.currency)})
            </span>
          </div>
        </div>
      </div>

      {/* Security & Audit Proof Card */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-gold" />
            <h2 className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Security & Ledger Audit
            </h2>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">RTGS-v2</span>
        </div>

        <div className="flex flex-col divide-y divide-border/40 text-xs">
          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Hash className="size-3.5" /> Reference ID
            </span>
            <span className="font-mono text-xs font-medium text-foreground">
              TXN-{tx.id.toUpperCase()}-HORIZON
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground">Verification Hash</span>
            <button
              type="button"
              onClick={handleCopyHash}
              className="inline-flex items-center gap-1 rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
              title="Click to copy hash"
            >
              <span>{auditHash.slice(0, 10)}...{auditHash.slice(-6)}</span>
              <Copy className="size-3" />
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground">Settlement Status</span>
            <span className="inline-flex items-center gap-1 font-semibold text-gold">
              <CheckCircle2 className="size-3" /> Finality Confirmed
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleDownloadReceipt}
          disabled={isDownloading}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background/80 py-2.5 px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted/50 hover:border-gold/30 disabled:opacity-50"
        >
          <Download className="size-3.5 text-gold" />
          <span>{isDownloading ? "Generating..." : "Download PDF"}</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background/80 py-2.5 px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted/50 hover:border-gold/30"
        >
          <Share2 className="size-3.5 text-muted-foreground" />
          <span>Share Proof</span>
        </button>
      </div>

      {/* Report Issue Action */}
      <div className="pt-1 text-center">
        <button
          type="button"
          onClick={handleReport}
          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-destructive"
        >
          <AlertCircle className="size-3" />
          <span>Report an issue with this transaction</span>
        </button>
      </div>
    </div>
  );
}
