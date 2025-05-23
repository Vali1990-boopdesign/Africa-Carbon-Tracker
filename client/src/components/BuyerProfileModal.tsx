import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Building2, MapPin, Calendar, TrendingUp, Award, Users } from "lucide-react";

interface BuyerTransaction {
  id: number;
  projectName: string;
  country: string;
  creditsRetired: number;
  retirementDate: string;
  projectType: string;
  registryId: string;
}

interface BuyerProfileData {
  brandName: string;
  sector: string;
  totalCredits: number;
  totalTransactions: number;
  averageTransactionSize: number;
  firstPurchase: string;
  lastPurchase: string;
  topCountries: Array<{ country: string; credits: number; percentage: number }>;
  topProjectTypes: Array<{ type: string; credits: number; percentage: number }>;
  monthlyTrend: Array<{ month: string; credits: number }>;
  transactions: BuyerTransaction[];
}

interface BuyerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  buyerName: string;
  data?: BuyerProfileData;
  isLoading: boolean;
}

export function BuyerProfileModal({ 
  isOpen, 
  onClose, 
  buyerName, 
  data, 
  isLoading 
}: BuyerProfileModalProps) {
  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Loading buyer profile...</DialogTitle>
          </DialogHeader>
          <div className="animate-pulse space-y-4">
            <div className="bg-gray-200 dark:bg-gray-700 rounded h-32 w-full" />
            <div className="bg-gray-200 dark:bg-gray-700 rounded h-48 w-full" />
            <div className="bg-gray-200 dark:bg-gray-700 rounded h-64 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!data) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Buyer Profile</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">No data available for {buyerName}</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            {data.brandName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {data.totalCredits.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Credits</div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {data.totalTransactions}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Transactions</div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.round(data.averageTransactionSize).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg. per Transaction</div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardContent className="p-4 text-center">
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {data.sector}
                </Badge>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Sector</div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Timeline */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">First Purchase:</span>
                  <span className="ml-2 font-medium">{new Date(data.firstPurchase).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Latest Purchase:</span>
                  <span className="ml-2 font-medium">{new Date(data.lastPurchase).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Countries */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Top Countries
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.topCountries.map((country, index) => (
                  <div key={country.country} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{country.country}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {country.credits.toLocaleString()} ({country.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={country.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Top Project Types */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Project Types
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.topProjectTypes.map((type, index) => (
                  <div key={type.type} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{type.type}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {type.credits.toLocaleString()} ({type.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={type.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Project</th>
                      <th className="text-left p-2">Country</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-right p-2">Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.transactions.slice(0, 8).map((transaction) => (
                      <tr key={transaction.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-2">
                          {new Date(transaction.retirementDate).toLocaleDateString()}
                        </td>
                        <td className="p-2 font-medium">{transaction.projectName}</td>
                        <td className="p-2">{transaction.country}</td>
                        <td className="p-2">
                          <Badge variant="outline" className="text-xs">
                            {transaction.projectType}
                          </Badge>
                        </td>
                        <td className="p-2 text-right font-medium">
                          {transaction.creditsRetired.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.transactions.length > 8 && (
                <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                  Showing 8 of {data.transactions.length} transactions
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}