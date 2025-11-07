import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { trackConversion } from "@/lib/analytics";
import { useToast } from "@/hooks/use-toast";

// Define lord-icon element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lord-icon': {
        src?: string;
        trigger?: string;
        colors?: string;
        style?: React.CSSProperties;
        onError?: (event: any) => void;
        onLoad?: (event: any) => void;
        state?: string;
      };
    }
  }
}

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
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isFormValid = () => {
    return (
      formData.name.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.message.trim() !== "" &&
      formData.message.length <= 200 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
      privacyConsent
    );
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
        type: "Contact Form",
      };

      // Send to Google Sheets via webhook/API
      await fetch(
        "https://script.google.com/macros/s/AKfycbyh_rJA5h3SNL4mNSzjNYXa84XPWqR98PWtkNwPOvP16stOovyjqImsSY_LVwUGxA8F4A/exec",
        {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(contactData),
        },
      );

      // Show success state
      setShowSuccess(true);
      
      // Track conversion
      trackConversion('form_submitted', 'contact_form');
    } catch (error) {
      console.error("Error sending contact form:", error);
      toast({
        title: "Error",
        description:
          "There was an error sending your message. Please try again.",
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
      message: "",
    });
    setPrivacyConsent(false);
    setShowSuccess(false);
    onClose();
  };

  const remainingChars = 200 - formData.message.length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-surface-container border text-on-surface max-w-2xl max-h-[90vh] overflow-y-auto">
        {showSuccess ? (
          // Success State
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="mb-6"
            >
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="text-emerald-500" size={48} />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-2xl font-semibold text-on-surface mb-3">
                Message Sent Successfully!
              </h3>
              <p className="text-muted-foreground mb-6">
                Thank you for your message. We'll get back to you soon!
              </p>
              <Button
                onClick={handleClose}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Close
              </Button>
            </motion.div>
          </div>
        ) : (
          // Form State
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-on-surface flex items-center">
                <lord-icon
                  src="/envelope-send.json"
                  trigger="hover"
                  style={{
                    width: "24px",
                    height: "24px",
                    marginRight: "8px"
                  }}
                />
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
              Have questions or suggestions about the Africa Carbon Dashboard?
              We'd love to hear from you!
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-on-surface-variant">
                Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="bg-surface-container-high border text-on-surface placeholder-muted-foreground mt-1"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <Label htmlFor="organisation" className="text-on-surface-variant">
                Organisation
              </Label>
              <Input
                id="organisation"
                type="text"
                value={formData.organisation}
                onChange={(e) =>
                  handleInputChange("organisation", e.target.value)
                }
                className="bg-surface-container-high border text-on-surface placeholder-muted-foreground mt-1"
                placeholder="Enter your organisation (optional)"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-on-surface-variant">
                Email <span className="text-red-400">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="bg-surface-container-high border text-on-surface placeholder-muted-foreground mt-1"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <Label htmlFor="message" className="text-on-surface-variant">
                Message <span className="text-red-400">*</span>
              </Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                className="bg-surface-container-high border text-on-surface placeholder-muted-foreground mt-1 min-h-[100px]"
                placeholder="Enter your message (max 200 characters)"
                maxLength={200}
              />
              <div className="flex justify-end mt-1">
                <span
                  className={`text-xs ${remainingChars < 0 ? "text-red-400" : remainingChars < 20 ? "text-yellow-400" : "text-muted-foreground"}`}
                >
                  {remainingChars} characters remaining
                </span>
              </div>
            </div>
          </div>

          {/* Privacy Disclaimer */}
          <div className="bg-surface-container-high/50 border rounded-lg p-4 space-y-3">
            <div className="text-xs text-muted-foreground leading-relaxed">
              By submitting your information, you consent to the collection,
              processing, and storage of your personal data (including your
              name, email address, and organisation name) in accordance with our{" "}
              <a
                href="https://bfaglobal.com/wp-content/uploads/2024/09/BFA-Global-Data-Protection-Binding-Corporate-Rules.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 underline"
              >
                Privacy Policy
              </a>{" "}
              and{" "}
              <a
                href="https://bfaglobal.com/wp-content/uploads/2024/09/BFA-Global-Kenya-Ltd-Data-Protection-Policy.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 underline"
              >
                Data Protection Policy
              </a>
              .
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed">
              We will only use your personal data to communicate with you and
              provide support related to carbon credits and relevant services.
              Your data will be stored securely for the sole purpose of
              fulfilling our service obligations. We will retain your data for
              as long as necessary to fulfill our commitments.
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed">
              You have the right to request access to, correction, or deletion
              of your personal data, and you can contact us at any time for
              assistance. For more details, please refer to our Data Protection
              Policy.
            </div>

            <div className="flex items-start space-x-3 pt-2">
              <Checkbox
                id="privacy-consent"
                checked={privacyConsent}
                onCheckedChange={(checked) => setPrivacyConsent(!!checked)}
                className="mt-0.5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
              />
              <Label
                htmlFor="privacy-consent"
                className="text-sm text-on-surface-variant cursor-pointer leading-relaxed"
              >
                I have read and agree to the privacy disclaimer above{" "}
                <span className="text-red-400">*</span>
              </Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="bg-transparent border text-on-surface-variant hover:bg-surface-container-high"
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
                <lord-icon
                  src="/envelope-send.json"
                  trigger="hover"
                  style={{
                    width: "20px",
                    height: "20px",
                    marginRight: "8px"
                  }}
                />
              )}
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </motion.div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
