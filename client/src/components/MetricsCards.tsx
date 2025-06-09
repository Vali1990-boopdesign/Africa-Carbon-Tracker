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
            <Card key={i} className="bg-background/60 backdrop-blur-md border-divider animate-pulse">
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
      title: "Buyers",
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
      title: "Avg Credit Price",
      value: `$${metrics.averageCreditPrice}`,
      change: `${metrics.priceChange}%`,
      changeLabel: "vs last month",
      isPositive: metrics.priceChange > 0,
      icon: DollarSign,
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
            <Card className="material-card glass-effect border-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="body-medium text-muted-foreground mb-1">{card.title}</p>
                    <p className="headline-medium text-foreground font-semibold mb-2">{card.value}</p>
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1 text-sm ${card.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {card.isPositive ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span className="label-medium font-medium">{card.change}</span>
                      </div>
                      <span className="body-small text-muted-foreground">{card.changeLabel}</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 ${card.iconBg} rounded-xl flex items-center justify-center`}>
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
