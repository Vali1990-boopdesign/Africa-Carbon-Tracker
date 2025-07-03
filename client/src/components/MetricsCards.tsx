import { Card, CardContent } from "@/components/ui/card";
import { Users, Globe, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { TermTooltip } from "./TermTooltip";
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
      key: "credit-transactions",
      titleComponent: <TermTooltip term="Credits Transacted" explanation="Total cumulative carbon credits of tCO2e transacted (retired, purchased, etc.) in time period. Pre-purchases are not captured here." />,
      value: metrics.totalCreditsRetired.toLocaleString(),
      icon: null,
      iconBg: "",
      iconColor: "",
      isLottie: true,
    },
    {
      key: "unique-buyers",
      titleComponent: <TermTooltip term="Unique Buyers" explanation="Distinct organizations that have purchased and retired carbon credits, representing the diversity of market participants committed to climate action" />,
      value: metrics.activeBuyers.toLocaleString(),
      icon: Users,
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-500",
    },
    {
      key: "african-countries",
      titleComponent: <TermTooltip term="African Countries" explanation="Number of African nations with active carbon credit projects, showcasing the continent's contribution to global climate mitigation efforts" />,
      value: metrics.africanCountries.toString(),
      icon: Globe,
      iconBg: "bg-amber-500/20",
      iconColor: "text-amber-500",
    },
    {
      key: "avg-credits",
      titleComponent: <TermTooltip term="Avg Credits per Transaction" explanation="Average number of carbon credits purchased in each transaction, indicating typical buying patterns and market participation scale" />,
      value: `${(metrics.averageCreditsPerTransaction || 0).toLocaleString()}`,
      icon: CreditCard,
      iconBg: "bg-purple-500/20",
      iconColor: "text-purple-500",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {cards.map((card, index) => (
          <motion.div
            key={card.key}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="glass-effect border-gray-700 bg-white/95 dark:bg-gray-900/95 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{card.titleComponent}</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</div>
                  </div>
                  <div className="flex items-center justify-center flex-shrink-0 ml-3">
                    {card.isLottie ? (
                      <lord-icon
                        src="/wired-outline-401-leaves-eco-hover-spin.json"
                        trigger="hover"
                        colors="primary:#10b981,secondary:#059669"
                        style={{
                          width: "32px",
                          height: "32px"
                        }}
                      />
                    ) : (
                      <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                        <card.icon className={card.iconColor} size={24} />
                      </div>
                    )}
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
