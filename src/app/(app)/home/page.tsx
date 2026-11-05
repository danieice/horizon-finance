"use client";

import { useEffect, useState, useTransition } from "react";
import { TopBar } from "@/components/shell/top-bar";
import { useStore } from "@/store/useStore";
import { mockRequest } from "@/lib/mock";
import {
  WealthOverview,
  FinancialHealth,
  SpendingChart,
  CategoryBreakdown,
  QuickStats,
  RecentActivity,
  AnalyticsSkeleton,
  TransactionDetails,
} from "@/components/analytics";

export default function HomePage() {
  const transactions = useStore((s) => s.transactions);
  const [loading, setLoading] = useState(true);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    // Brief realistic mock delay so skeletons and transitions render cleanly
    let isMounted = true;
    mockRequest({ status: "loaded" }, 350).then(() => {
      if (isMounted) setLoading(false);
    });

    // Sync from URL query parameter ?tx=<id> if present on load
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const initialTx = params.get("tx");
      if (initialTx) {
        setSelectedTxId(initialTx);
      }
    }

    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setSelectedTxId(params.get("tx"));
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      isMounted = false;
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const handleSelectTransaction = (id: string) => {
    startTransition(() => {
      setSelectedTxId(id);
    });
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tx", id);
      window.history.pushState(null, "", url.toString());
    }
  };

  const handleBackToDashboard = () => {
    startTransition(() => {
      setSelectedTxId(null);
    });
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("tx");
      window.history.pushState(null, "", url.toString());
    }
  };

  const activeTransaction = selectedTxId
    ? transactions.find((t) => t.id === selectedTxId)
    : null;

  return (
    <>
      <TopBar title={activeTransaction ? "Transaction Details" : "Home"} />
      <main className="flex-1 px-4 py-4 space-y-4">
        {loading ? (
          <AnalyticsSkeleton />
        ) : activeTransaction ? (
          <TransactionDetails
            tx={activeTransaction}
            onBack={handleBackToDashboard}
          />
        ) : (
          <>
            <WealthOverview />
            <QuickStats />
            <FinancialHealth />
            <SpendingChart />
            <CategoryBreakdown />
            <RecentActivity onSelectTransaction={handleSelectTransaction} />
          </>
        )}
      </main>
    </>
  );
}
