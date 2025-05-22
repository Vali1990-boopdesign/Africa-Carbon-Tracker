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
      title: "Geographic Concentration",
      description: "Zimbabwe and Kenya dominate with 23.8M credits (48% of total)",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/20"
    },
    {
      icon: Factory,
      title: "Sector Leaders",
      description: "Energy/Mining/Utilities sector leads with 16.4M credits",
      color: "text-blue-500",
      bgColor: "bg-blue-500/20"
    },
    {
      icon: TrendingUp,
      title: "Growth Trajectory",
      description: "Peaked in 2021-2022 at ~11M credits/year, declined 38% in 2023",
      color: "text-amber-500",
      bgColor: "bg-amber-500/20"
    },
    {
      icon: Factory,
      title: "Project Types",
      description: "REDD+ (forest conservation) dominates with 25.6M credits, followed by cookstoves at 12.4M",
      color: "text-green-500",
      bgColor: "bg-green-500/20"
    },
    {
      icon: Users,
      title: "Buyer Diversity",
      description: "3,149 unique buyers across 19 sectors from global HQs",
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
      <Card className="glass-effect border-gray-700 h-40">
        <CardHeader>
          <div className="h-6 bg-gray-700 rounded w-32 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-dark-800/30 rounded-lg animate-pulse"></div>
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
      <Card className="glass-effect h-40 relative overflow-hidden border-2 border-transparent bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20" style={{
        borderImage: 'linear-gradient(135deg, #10b981, #3b82f6, #a855f7) 1'
      }}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white">Key Insights</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevInsight}
                className="text-gray-400 hover:text-white h-8 w-8"
              >
                <ChevronLeft size={16} />
              </Button>
              <div className="flex space-x-1">
                {insights.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      index === currentInsight ? 'bg-emerald-500' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextInsight}
                className="text-gray-400 hover:text-white h-8 w-8"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
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
                <h3 className="text-white font-semibold text-base mb-2">{currentInsightData.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{currentInsightData.description}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}