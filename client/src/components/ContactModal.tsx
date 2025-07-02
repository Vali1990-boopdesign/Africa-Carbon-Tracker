
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    organisation: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = () => {
    return formData.name.trim() !== "" && 
           formData.email.trim() !== "" && 
           formData.message.trim() !== "" &&
           formData.message.length <= 200 &&
           /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;
    
    setIsSubmitting(true);
    
    try {
      // Send contact form data to Google Sheets
      const contactData = {
        timestamp: new Date().toISOString(),
        name: formData.name,
        organisation: formData.organisation || "Not provided",
        email: formData.email,
        message: formData.message,
        type: "Contact Form"
      };

      // Send to Google Sheets via webhook/API
      await fetch("https://script.google.com/macros/s/AKfycbyh_rJA5h3SNL4mNSzjNYXa84XPWqR98PWtkNwPOvP16stOovyjqImsSY_LVwUGxA8F4A/exec", {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactData)
      });

      toast({
        title: "Message Sent",
        description: "Thank you for your message. We'll get back to you soon!",
      });
      
      // Reset form and close modal
      setFormData({
        name: "",
        organisation: "",
        email: "",
        message: ""
      });
      onClose();
    } catch (error) {
      console.error("Error sending contact form:", error);
      toast({
        title: "Error",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      organisation: "",
      email: "",
      message: ""
    });
    onClose();
  };

  const remainingChars = 200 - formData.message.length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white flex items-center">
            <MessageCircle className="mr-2" size={20} />
            Contact Us
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Contact Info */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
            <p className="text-sm text-emerald-400">
              Have questions about the Africa Carbon Dashboard? We'd love to hear from you!
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
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 mt-1"
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
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 mt-1"
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
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 mt-1"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <Label htmlFor="message" className="text-gray-300">
                Message <span className="text-red-400">*</span>
              </Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 mt-1 min-h-[100px]"
                placeholder="Enter your message (max 200 characters)"
                maxLength={200}
              />
              <div className="flex justify-end mt-1">
                <span className={`text-xs ${remainingChars < 0 ? 'text-red-400' : remainingChars < 20 ? 'text-yellow-400' : 'text-gray-400'}`}>
                  {remainingChars} characters remaining
                </span>
              </div>
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
                <MessageCircle className="mr-2" size={16} />
              )}
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
