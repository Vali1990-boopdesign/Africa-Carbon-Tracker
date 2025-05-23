import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BuyerBubbleChart } from "@/components/BuyerBubbleChart";
import { BuyerProfileModal } from "@/components/BuyerProfileModal";
import { TopBuyers } from "@/components/TopBuyers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Buyers() {
  const [selectedBuyer, setSelectedBuyer] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Fetch top buyers data for bubble chart
  const { data: topBuyers, isLoading } = useQuery({
    queryKey: ['/api/dashboard/top-buyers'],
  });

  // Fetch buyer profile when a buyer is selected
  const { data: buyerProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['/api/buyers', selectedBuyer, 'profile'],
    enabled: !!selectedBuyer && isProfileModalOpen,
  });

  const handleBuyerClick = (buyerName: string) => {
    setSelectedBuyer(buyerName);
    setIsProfileModalOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileModalOpen(false);
    setSelectedBuyer(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white hover:text-gray-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Buyer Analytics
            </h1>
            <p className="text-gray-300">
              Interactive analysis of carbon credit buyers and their purchasing patterns
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Bubble Chart */}
          <div className="xl:col-span-2">
            <BuyerBubbleChart 
              data={topBuyers}
              isLoading={isLoading}
              onBuyerClick={handleBuyerClick}
            />
          </div>

          {/* Side Panel with Top Buyers List */}
          <div className="xl:col-span-1">
            <TopBuyers
              topBuyers={topBuyers}
              isLoading={isLoading}
              onBuyerClick={handleBuyerClick}
            />
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg text-white">Total Buyers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">
                {topBuyers?.length || 0}
              </div>
              <p className="text-gray-400 text-sm mt-1">Active carbon credit buyers</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg text-white">Market Concentration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">
                {topBuyers ? Math.round(topBuyers.slice(0, 3).reduce((sum, buyer) => sum + buyer.percentage, 0)) : 0}%
              </div>
              <p className="text-gray-400 text-sm mt-1">Top 3 buyers market share</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg text-white">Sectors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">
                {topBuyers ? new Set(topBuyers.map(b => b.sector)).size : 0}
              </div>
              <p className="text-gray-400 text-sm mt-1">Different industry sectors</p>
            </CardContent>
          </Card>
        </div>

        {/* Buyer Profile Modal */}
        <BuyerProfileModal
          isOpen={isProfileModalOpen}
          onClose={handleCloseProfile}
          buyerName={selectedBuyer || ''}
          data={buyerProfile}
          isLoading={isProfileLoading}
        />
      </div>
    </div>
  );
}