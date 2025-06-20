
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Download, X } from "lucide-react";
import { motion } from "framer-motion";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  exportType: "all" | "selected";
  selectedCount?: number;
}

export function ExportModal({ isOpen, onClose, onExport, exportType, selectedCount }: ExportModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    organisation: "",
    email: "",
    disclaimerAccepted: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = () => {
    return formData.name.trim() !== "" && 
           formData.email.trim() !== "" && 
           formData.disclaimerAccepted &&
           /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;
    
    setIsSubmitting(true);
    
    try {
      // Log download request to Google Sheets
      const downloadData = {
        timestamp: new Date().toISOString(),
        name: formData.name,
        organisation: formData.organisation || "Not provided",
        email: formData.email,
        exportType: exportType,
        recordCount: exportType === "selected" ? selectedCount : "All records",
        disclaimerAccepted: "Yes"
      };

      // Send to Google Sheets via webhook/API
      await fetch("https://script.google.com/macros/s/AKfycbzXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/exec", {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(downloadData)
      });

      // Proceed with the actual export
      onExport();
      
      // Reset form and close modal
      setFormData({
        name: "",
        organisation: "",
        email: "",
        disclaimerAccepted: false
      });
      onClose();
    } catch (error) {
      console.error("Error logging download:", error);
      // Still proceed with export even if logging fails
      onExport();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      organisation: "",
      email: "",
      disclaimerAccepted: false
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-dark-900 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white flex items-center">
            <Download className="mr-2" size={20} />
            Export Carbon Credits Data
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Export Info */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
            <p className="text-sm text-emerald-400">
              {exportType === "selected" 
                ? `Exporting ${selectedCount} selected records`
                : "Exporting all transaction records"
              }
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-gray-300">
                Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="bg-dark-800 border-gray-600 text-white mt-1"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <Label htmlFor="organisation" className="text-gray-300">
                Organisation
              </Label>
              <Input
                id="organisation"
                type="text"
                value={formData.organisation}
                onChange={(e) => handleInputChange("organisation", e.target.value)}
                className="bg-dark-800 border-gray-600 text-white mt-1"
                placeholder="Enter your organisation (optional)"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-300">
                Email <span className="text-red-400">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="bg-dark-800 border-gray-600 text-white mt-1"
                placeholder="Enter your email address"
              />
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <h3 className="font-semibold text-amber-400 mb-3">
              Disclaimer (Please Read Before Downloading):
            </h3>
            <div className="text-sm text-gray-300 space-y-2 leading-relaxed">
              <p>
                This dataset is a cleaned and curated extract from the Berkeley Carbon Trading Project's 
                Voluntary Registry Offsets Database, focused on entities that have transacted African 
                carbon credits in transaction quantities of 10 or more credits. While efforts have been 
                made to verify, categorize, and enhance the data using AI-supported tools, it may contain 
                errors, omissions, or assumptions (e.g., equating "retirements" with "purchases").
              </p>
              <p className="font-medium text-white">By checking the box below, you acknowledge that:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>You accept full responsibility for how you use the data.</li>
                <li>The dataset is provided as-is, without warranties or guarantees of accuracy.</li>
                <li>
                  Attribution must also be given to the Berkeley Carbon Trading Project as the 
                  original data source in any reuse or publication.
                </li>
              </ul>
            </div>

            <div className="flex items-start space-x-3 mt-4">
              <Checkbox
                id="disclaimer"
                checked={formData.disclaimerAccepted}
                onCheckedChange={(checked) => handleInputChange("disclaimerAccepted", checked as boolean)}
                className="border-amber-500 data-[state=checked]:bg-amber-600 mt-1"
              />
              <Label htmlFor="disclaimer" className="text-sm text-white cursor-pointer leading-relaxed">
                I acknowledge and accept the above terms and wish to proceed with the download.
              </Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid() || isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
            >
              {isSubmitting ? (
                <motion.div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <Download className="mr-2" size={16} />
              )}
              {isSubmitting ? "Processing..." : "Download Data"}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
