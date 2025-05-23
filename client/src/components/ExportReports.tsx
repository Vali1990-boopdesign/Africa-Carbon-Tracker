import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, BarChart3, Users, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ExportReportsProps {
  filters: any;
  selectedTransactions?: number[];
}

export function ExportReports({ filters, selectedTransactions = [] }: ExportReportsProps) {
  const { toast } = useToast();
  const [exportFormat, setExportFormat] = useState<"csv" | "excel">("csv");
  const [reportType, setReportType] = useState<"transactions" | "summary" | "buyers" | "countries">("transactions");
  const [includeFilters, setIncludeFilters] = useState(true);

  const exportMutation = useMutation({
    mutationFn: async (data: { format: string; type: string; filters: any; transactionIds: number[] }) => {
      return apiRequest('/api/export', 'POST', data);
    },
    onSuccess: (data: any) => {
      toast({
        title: "Export Started",
        description: `Your ${reportType} report in ${exportFormat.toUpperCase()} format is being generated.`,
      });
      
      // In a real app, this would trigger a download
      console.log("Export data:", data);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "There was an error generating your report. Please try again.",
      });
    }
  });

  const handleExport = () => {
    exportMutation.mutate({
      format: exportFormat,
      type: reportType,
      filters: includeFilters ? filters : {},
      transactionIds: selectedTransactions
    });
  };

  const reportOptions = [
    { value: "transactions", label: "Transaction Details", icon: FileText, description: "Complete transaction records" },
    { value: "summary", label: "Executive Summary", icon: BarChart3, description: "Key metrics and trends" },
    { value: "buyers", label: "Buyer Analysis", icon: Users, description: "Buyer profiles and purchasing patterns" },
    { value: "countries", label: "Geographic Report", icon: Globe, description: "Country-wise carbon credit distribution" }
  ];

  const selectedReport = reportOptions.find(r => r.value === reportType);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export & Reports
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Type Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Report Type
          </label>
          <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
            <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              {reportOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <option.icon className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Export Format */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Export Format
          </label>
          <div className="flex gap-2">
            <Button
              variant={exportFormat === "csv" ? "default" : "outline"}
              onClick={() => setExportFormat("csv")}
              className="flex-1"
            >
              CSV
            </Button>
            <Button
              variant={exportFormat === "excel" ? "default" : "outline"}
              onClick={() => setExportFormat("excel")}
              className="flex-1"
            >
              Excel
            </Button>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Export Options
          </label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-filters"
                checked={includeFilters}
                onCheckedChange={setIncludeFilters}
              />
              <label
                htmlFor="include-filters"
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                Apply current filters to export
              </label>
            </div>
          </div>
        </div>

        {/* Selection Summary */}
        {selectedTransactions.length > 0 && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                {selectedTransactions.length} Selected
              </Badge>
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Exporting selected transactions only
              </span>
            </div>
          </div>
        )}

        {/* Current Report Summary */}
        {selectedReport && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-3">
              <selectedReport.icon className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {selectedReport.label}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedReport.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {exportFormat.toUpperCase()}
                  </Badge>
                  {includeFilters && (
                    <Badge variant="outline" className="text-xs">
                      Filtered
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Export Button */}
        <Button
          onClick={handleExport}
          disabled={exportMutation.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {exportMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Generating Report...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Generate {selectedReport?.label}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}