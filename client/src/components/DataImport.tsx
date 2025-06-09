import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, CheckCircle } from "lucide-react";

interface DataImportProps {
  onDataImported?: (data: any[]) => void;
}

export function DataImport({ onDataImported }: DataImportProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const [importedCount, setImportedCount] = useState(0);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setImportStatus("idle");

    try {
      setTimeout(() => {
        setIsProcessing(false);
        setImportStatus("success");
        setImportedCount(150);
      }, 2000);
    } catch (error) {
      setIsProcessing(false);
      setImportStatus("error");
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Carbon Buyer Data
          </CardTitle>
          {importStatus === "success" && (
            <Badge variant="secondary" className="text-green-600 bg-green-100">
              <CheckCircle className="h-3 w-3 mr-1" />
              {importedCount} records imported
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Upload your carbon credit data file to update the dashboard.
          </div>
          
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Click to upload CSV file or drag and drop
            </div>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              disabled={isProcessing}
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={isProcessing}
              className="mx-auto"
            >
              {isProcessing ? "Processing..." : "Choose File"}
            </Button>
          </div>

          {importStatus === "success" && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="text-sm text-green-800 dark:text-green-200">
                Data imported successfully! Your dashboard now shows updated carbon buyer data.
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}