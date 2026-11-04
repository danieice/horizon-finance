"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/shell/top-bar";
import { mockRequest } from "@/lib/mock";
import {
  WealthOverview,
  FinancialHealth,
  SpendingChart,
  CategoryBreakdown,
  QuickStats,
  RecentActivity,
  AnalyticsSkeleton,
} from "@/components/analytics";

export default function HomePage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Brief realistic mock delay so skeletons and transitions render cleanly
    let isMounted = true;
    mockRequest({ status: "loaded" }, 350).then(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <TopBar title="Home" />
      <main className="flex-1 px-4 py-4 space-y-4">
        {loading ? (
          <AnalyticsSkeleton />
        ) : (
          <>
            <WealthOverview />
            <QuickStats />
            <FinancialHealth />
            <SpendingChart />
            <CategoryBreakdown />
            <RecentActivity />
          </>
        )}
      </main>
    </>
  );
}
