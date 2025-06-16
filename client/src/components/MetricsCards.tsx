import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, Globe, DollarSign, Leaf } from "lucide-react";
import { motion } from "framer-motion";
import type { DashboardMetrics } from "@shared/schema";

interface MetricsCardsProps {
  metrics?: DashboardMetrics;
  isLoading: boolean;
}

export function MetricsCards({ metrics, isLoading }: MetricsCardsProps) {
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="glass-effect border-gray-700 animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
                    <div className="h-8 bg-gray-700 rounded w-16 mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-32"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="text-center text-gray-400">
          <p>Unable to load metrics data</p>
        </div>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Credits",
      value: `${(metrics.totalCreditsRetired / 1000).toFixed(1)}M`,
      change: `+${metrics.totalCreditsGrowth}%`,
      changeLabel: "vs last year",
      isPositive: metrics.totalCreditsGrowth > 0,
      icon: Leaf,
      iconBg: "bg-emerald-500/20",
      iconColor: "text-emerald-500",
    },
    {
      title: "Total Buyers",
      value: metrics.activeBuyers.toLocaleString(),
      change: `+${metrics.activeBuyersGrowth}`,
      changeLabel: "this month",
      isPositive: true,
      icon: Users,
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-500",
    },
    {
      title: "African Countries",
      value: metrics.africanCountries.toString(),
      change: `${metrics.newCountriesThisQuarter} new`,
      changeLabel: "this quarter",
      isPositive: true,
      icon: Globe,
      iconBg: "bg-amber-500/20",
      iconColor: "text-amber-500",
    },
    {
      title: "Avg Credits per Transaction",
      value: `${metrics.averageCreditsPerTransaction.toLocaleString()}`,
      change: `${metrics.transactionChange}%`,
      changeLabel: "vs last month",
      isPositive: metrics.transactionChange > 0,
      icon: Leaf,
      iconBg: "bg-green-500/20",
      iconColor: "text-green-500",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="glass-effect border-gray-700 bg-white/95 dark:bg-gray-900/95 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>

                  </div>
                  <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                    <card.icon className={card.iconColor} size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
