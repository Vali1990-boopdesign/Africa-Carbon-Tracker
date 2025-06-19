
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, TrendingUp, MapPin, Factory, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface KeyInsightsProps {
  isLoading?: boolean;
}

export function KeyInsights({ isLoading }: KeyInsightsProps) {
  const [currentInsight, setCurrentInsight] = useState(0);

  const insights = [
    {
      icon: MapPin,
      title: "Market Concentration",
      description: "Three countries—Zimbabwe, Kenya, and Uganda—control 64.3% of Africa's carbon credit supply, creating significant geographic concentration risk and untapped potential in underrepresented markets.",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/20"
    },
    {
      icon: Users,
      title: "European Demand Dominance",
      description: "European buyers account for 69.6% of all African carbon credit purchases (59.8M credits) with 2,908 active buyers, significantly outpacing North America's 13.7% market share.",
      color: "text-blue-500",
      bgColor: "bg-blue-500/20"
    },
    {
      icon: Factory,
      title: "Nature-Based Solutions Leadership",
      description: "REDD+ forest protection projects generate 42.2% of all credits (36.3M), followed by cookstove initiatives at 24.4%, demonstrating strong market preference for nature-based and community-impact solutions.",
      color: "text-green-500",
      bgColor: "bg-green-500/20"
    },
    {
      icon: TrendingUp,
      title: "Post-2021 Market Decline",
      description: "African carbon credit retirements declined 36.7% from 2022 to 2024, dropping from 16.5M to 10.4M credits.",
      color: "text-amber-500",
      bgColor: "bg-amber-500/20"
    },
    {
      icon: Factory,
      title: "Sector Diversification Opportunity",
      description: "Energy and utilities lead corporate purchasing at 23.2% of market share, while apparel and fashion rank second at 11.1%, highlighting diverse sectoral adoption beyond traditional heavy industries.",
      color: "text-purple-500",
      bgColor: "bg-purple-500/20"
    }
  ];

  // Auto-rotate insights every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentInsight((prev) => (prev + 1) % insights.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [insights.length]);

  const nextInsight = () => {
    setCurrentInsight((prev) => (prev + 1) % insights.length);
  };

  const prevInsight = () => {
    setCurrentInsight((prev) => (prev - 1 + insights.length) % insights.length);
  };

  if (isLoading) {
    return (
      <Card className="h-40">
        <CardHeader>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  const currentInsightData = insights[currentInsight];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="p-[2px] rounded-xl bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500">
        <Card className="min-h-48 relative overflow-hidden bg-background">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between w-full">
            <h3 className="text-lg font-semibold">Key Insights</h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevInsight}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft size={16} />
              </Button>
              <div className="flex space-x-1">
                {insights.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      index === currentInsight ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextInsight}
                className="h-8 w-8 p-0"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentInsight}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex items-start space-x-4"
            >
              <div className={`w-12 h-12 ${currentInsightData.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <currentInsightData.icon className={currentInsightData.color} size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground mb-2">{currentInsightData.title}</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{currentInsightData.description}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
      </div>
    </motion.div>
  );
}
