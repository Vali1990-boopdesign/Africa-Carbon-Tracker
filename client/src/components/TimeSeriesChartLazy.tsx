import { lazy, Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { TimeSeriesData, Transaction } from "@shared/schema";

const TimeSeriesChart = lazy(() => import("./TimeSeriesChart").then(module => ({ default: module.TimeSeriesChart })));

interface SectorData {
  sector: string;
  totalCredits: number;
  percentage: number;
  color: string;
}

interface TopBuyerData {
  brandName: string;
  sector: string;
  totalCredits: number;
  percentage: number;
  initials: string;
  color: string;
}

interface TimeSeriesChartLazyProps {
  timeSeriesData?: TimeSeriesData[];
  sectorData?: SectorData[];
  topBuyers?: TopBuyerData[];
  transactions?: Transaction[];
  isLoading: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ChartSkeleton = () => (
  <Card className="glass-effect border min-h-[28rem]">
    <CardContent className="p-6">
      <div className="flex items-center mb-6 border-b border">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="px-4 py-2 mr-4">
            <div className="h-4 bg-surface-container rounded w-16 animate-pulse"></div>
          </div>
        ))}
      </div>
      <div className="h-72 bg-surface-container/30 rounded-lg animate-pulse"></div>
    </CardContent>
  </Card>
);

export function TimeSeriesChartLazy(props: TimeSeriesChartLazyProps) {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <TimeSeriesChart {...props} />
    </Suspense>
  );
}
