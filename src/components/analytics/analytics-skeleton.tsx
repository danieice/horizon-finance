"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function AnalyticsSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {/* Top greeting skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>

      {/* Balance Card Skeleton */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-24 rounded-full" />
        </div>
        <Skeleton className="h-9 w-44" />
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
        </div>
        <div className="grid grid-cols-3 gap-2 pt-2">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      </div>

      {/* Health Score Skeleton */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <div className="flex items-center gap-4 rounded-xl bg-muted/20 p-3">
          <Skeleton className="size-20 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      </div>

      {/* Chart Skeleton */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-6 w-24 rounded-lg" />
        </div>
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    </div>
  );
}

