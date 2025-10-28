import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycby5U_nJ1a-ETnGIUVKQGPPxiRGcAfQBchMtkRiEnwGq4LmYps1UZefT-8jVYBRyr-k/exec";

const FEEDBACK_CONFIG = {
  MIN_TIME_ON_PAGE: 75000, // 75 seconds
  MIN_INTERACTIONS: 3,
  MIN_SCROLL_DEPTH: 50, // percentage
  REPEAT_INTERVAL_DAYS: 45,
  LOCAL_STORAGE_KEYS: {
    lastShown: "feedback_modal_last_shown",
    submitted: "feedback_submitted",
  },
};

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    q1_usefulness: null as number | null,
    q1_followup: "",
    q2_use_case: "",
    q2_other_specify: "",
    q3_future_feature: "",
    q4_follow_up: false,
    q4_email: "",
    privacyConsent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [emailError, setEmailError] = useState("");

  const totalSteps = 3;

  // Email validation
  const validateEmail = (email: string): boolean => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  };

  // Handle usefulness rating change
  const handleUsefulnessChange = (value: number) => {
    setFormData((prev) => ({ ...prev, q1_usefulness: value }));
  };

  // Navigate to next step
  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Navigate to previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Generate session ID
  const generateSessionId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Check if current step is valid
  const isStepValid = (): boolean => {
    switch (currentStep) {
      case 1:
        return formData.q1_usefulness !== null;
      case 2:
        return formData.q2_use_case !== "";
      case 3:
        // Step 3 has optional fields, always valid
        // But if email is provided, it must be valid and consent must be given
        if (formData.q4_follow_up && formData.q4_email) {
          return validateEmail(formData.q4_email) && formData.privacyConsent;
        }
        return true;
      default:
        return false;
    }
  };

  // Sanitize URL to remove query parameters
  const sanitizeUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
    } catch {
      return url;
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!isStepValid()) return;

    setIsSubmitting(true);
    setEmailError("");

    try {
      const payload = {
        timestamp: new Date().toISOString(),
        sessionId: generateSessionId(),
        q1_usefulness_score: formData.q1_usefulness,
        q1_followup_text: formData.q1_followup || "",
        q2_primary_use_case: formData.q2_use_case,
        q2_other_specify: formData.q2_other_specify || "",
        q3_future_feature: formData.q3_future_feature || "",
        q4_open_to_followup: formData.q4_follow_up,
        q4_email:
          formData.q4_follow_up && formData.privacyConsent
            ? formData.q4_email.trim().toLowerCase()
            : "",
        user_agent: navigator.userAgent,
        referrer_url: sanitizeUrl(document.referrer || window.location.href),
      };

      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Record submission
      localStorage.setItem(
        FEEDBACK_CONFIG.LOCAL_STORAGE_KEYS.submitted,
        Date.now().toString(),
      );

      setShowSuccess(true);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setEmailError(
        "There was an error submitting your feedback. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset and close modal
  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      q1_usefulness: null,
      q1_followup: "",
      q2_use_case: "",
      q2_other_specify: "",
      q3_future_feature: "",
      q4_follow_up: false,
      q4_email: "",
      privacyConsent: false,
    });
    setShowSuccess(false);
    setEmailError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-36 right-6 z-50 w-[400px] max-h-[600px] bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden"
      >
        {showSuccess ? (
          <div className="p-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center text-center space-y-3"
            >
              <div className="w-12 h-12 bg-emerald-600/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-white">
                Thank you for your feedback
              </h2>
              <p className="text-gray-400 text-sm">
                Your insights help us continuously improve the dashboard's
                functionality and user experience.
              </p>
              <Button
                onClick={handleClose}
                className="bg-emerald-600 hover:bg-emerald-700 text-white mt-2"
                data-testid="button-close-success"
              >
                Close
              </Button>
            </motion.div>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Help Us Improve
                  </h2>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Share your experience with the dashboard
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-white transition-colors ml-2"
                  data-testid="button-close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="px-4 pt-3 pb-2">
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>
                  Step {currentStep} of {totalSteps}
                </span>
                <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div
                  className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            <div className="px-4 overflow-y-auto max-h-[400px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 py-2"
                >
                  {/* Step 1: Usefulness Scale */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-semibold text-white mb-3 block">
                          How useful was the dashboard for your needs?{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-400 px-1">
                            <span>Not useful</span>
                            <span>Very useful</span>
                          </div>
                          <div className="grid grid-cols-11 gap-1">
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => handleUsefulnessChange(num)}
                                className={`h-10 rounded border-2 transition-all text-sm font-semibold ${
                                  formData.q1_usefulness === num
                                    ? "bg-emerald-600 border-emerald-500 text-white scale-105"
                                    : "bg-gray-800 border-gray-600 text-gray-300 hover:border-emerald-500/50 hover:bg-gray-700"
                                }`}
                                data-testid={`rating-${num}`}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Conditional Follow-up */}
                      {formData.q1_usefulness !== null &&
                        formData.q1_usefulness < 5 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="space-y-1.5"
                          >
                            <Label className="text-white text-sm">
                              What might help make it more useful?
                            </Label>
                            <Textarea
                              value={formData.q1_followup}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  q1_followup: e.target.value,
                                }))
                              }
                              placeholder="Share your thoughts..."
                              maxLength={300}
                              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 min-h-[80px] text-sm"
                              data-testid="input-followup"
                            />
                            <p className="text-xs text-gray-500 text-right">
                              {formData.q1_followup.length}/300
                            </p>
                          </motion.div>
                        )}
                    </div>
                  )}

                  {/* Step 2: Use Case */}
                  {currentStep === 2 && (
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-white mb-2 block">
                        What did you primarily use the dashboard for?{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <RadioGroup
                        value={formData.q2_use_case}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            q2_use_case: value,
                          }))
                        }
                        className="space-y-2"
                      >
                        {[
                          {
                            value: "identify_buyers",
                            label: "Identifying potential carbon credit buyers",
                          },
                          {
                            value: "market_trends",
                            label: "Understanding market trends",
                          },
                          {
                            value: "project_scope",
                            label: "Exploring demand by project scope",
                          },
                          {
                            value: "research_policy",
                            label: "Research or policy analysis",
                          },
                          { value: "other", label: "Other" },
                        ].map((option) => (
                          <div
                            key={option.value}
                            className="flex items-center space-x-2 p-2 rounded border border-gray-700 hover:border-emerald-500/50 bg-gray-800/50 transition-colors"
                          >
                            <RadioGroupItem
                              value={option.value}
                              id={option.value}
                              data-testid={`radio-${option.value}`}
                            />
                            <Label
                              htmlFor={option.value}
                              className="text-white text-sm cursor-pointer flex-1 font-normal"
                            >
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>

                      {formData.q2_use_case === "other" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-2"
                        >
                          <Input
                            value={formData.q2_other_specify}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                q2_other_specify: e.target.value,
                              }))
                            }
                            placeholder="Please specify..."
                            className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 text-sm"
                            data-testid="input-other"
                          />
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Step 3: Future Feature + Follow-up */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-semibold text-white">
                          What ONE feature would make this 10x more useful?
                        </Label>
                        <Textarea
                          value={formData.q3_future_feature}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              q3_future_feature: e.target.value,
                            }))
                          }
                          placeholder="Describe your ideal feature..."
                          maxLength={200}
                          className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 min-h-[80px] text-sm"
                          data-testid="input-feature"
                        />
                        <p className="text-xs text-gray-500 text-right">
                          {formData.q3_future_feature.length}/200
                        </p>
                      </div>

                      {/* Follow-up Checkbox */}
                      <div className="space-y-3 p-3 bg-gray-800/50 rounded border border-gray-700">
                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="follow-up"
                            checked={formData.q4_follow_up}
                            onCheckedChange={(checked) =>
                              setFormData((prev) => ({
                                ...prev,
                                q4_follow_up: checked as boolean,
                              }))
                            }
                            className="mt-0.5"
                            data-testid="checkbox-followup"
                          />
                          <Label
                            htmlFor="follow-up"
                            className="text-white text-sm cursor-pointer font-normal leading-snug"
                          >
                            I'm open to a 10-minute follow-up conversation
                          </Label>
                        </div>

                        {/* Email Input with Privacy Consent */}
                        {formData.q4_follow_up && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="space-y-2 pl-6"
                          >
                            <div>
                              <Label className="text-white text-sm mb-1.5 block">
                                Email
                              </Label>
                              <Input
                                type="email"
                                value={formData.q4_email}
                                onChange={(e) => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    q4_email: e.target.value,
                                  }));
                                  setEmailError("");
                                }}
                                placeholder="your.email@example.com"
                                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 text-sm"
                                data-testid="input-email"
                              />
                              {emailError && (
                                <p className="text-xs text-red-500 mt-1">
                                  {emailError}
                                </p>
                              )}
                            </div>

                            {/* Privacy Consent */}
                            <div className="flex items-start space-x-2 p-2 bg-gray-900/50 rounded border border-gray-600">
                              <Checkbox
                                id="privacy-consent"
                                checked={formData.privacyConsent}
                                onCheckedChange={(checked) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    privacyConsent: checked as boolean,
                                  }))
                                }
                                className="mt-0.5"
                                data-testid="checkbox-consent"
                              />
                              <Label
                                htmlFor="privacy-consent"
                                className="text-xs text-gray-400 cursor-pointer font-normal leading-snug"
                              >
                                I consent to BFA Global storing my email for
                                follow-up only. Not used for marketing.
                              </Label>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between p-4 border-t border-gray-700">
              <Button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 disabled:opacity-50"
                data-testid="button-back"
              >
                <ChevronLeft className="w-3 h-3 mr-1" />
                Back
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                  data-testid="button-next"
                >
                  Next
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isStepValid()}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                  data-testid="button-submit"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              )}
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// Hook for smart timing trigger
export function useFeedbackTrigger(onTrigger: () => void) {
  useEffect(() => {
    // Check if user has seen/submitted recently
    const lastShown = localStorage.getItem(
      FEEDBACK_CONFIG.LOCAL_STORAGE_KEYS.lastShown,
    );
    const submitted = localStorage.getItem(
      FEEDBACK_CONFIG.LOCAL_STORAGE_KEYS.submitted,
    );

    if (lastShown || submitted) {
      const timestamp = lastShown || submitted;
      const daysSince =
        (Date.now() - parseInt(timestamp!)) / (1000 * 60 * 60 * 24);

      if (daysSince < FEEDBACK_CONFIG.REPEAT_INTERVAL_DAYS) {
        return;
      }
    }

    let timeOnPage = 0;
    let interactionCount = 0;
    let maxScrollDepth = 0;
    let hasTriggered = false;

    const startTime = Date.now();

    const checkTrigger = () => {
      if (hasTriggered) return;

      const timeCondition = timeOnPage >= FEEDBACK_CONFIG.MIN_TIME_ON_PAGE;
      const interactionCondition =
        interactionCount >= FEEDBACK_CONFIG.MIN_INTERACTIONS;
      const scrollCondition =
        maxScrollDepth >= FEEDBACK_CONFIG.MIN_SCROLL_DEPTH;

      if (timeCondition && (interactionCondition || scrollCondition)) {
        hasTriggered = true;
        localStorage.setItem(
          FEEDBACK_CONFIG.LOCAL_STORAGE_KEYS.lastShown,
          Date.now().toString(),
        );
        onTrigger();
      }
    };

    const timeCheckInterval = setInterval(() => {
      timeOnPage = Date.now() - startTime;
      checkTrigger();
    }, 1000);

    const trackInteraction = () => {
      interactionCount++;
      checkTrigger();
    };

    const trackScroll = () => {
      const scrollPercentage =
        (window.scrollY /
          (document.documentElement.scrollHeight - window.innerHeight)) *
        100;
      maxScrollDepth = Math.max(maxScrollDepth, scrollPercentage);
      checkTrigger();
    };

    document.addEventListener("click", trackInteraction);
    document.addEventListener("scroll", trackScroll);

    return () => {
      clearInterval(timeCheckInterval);
      document.removeEventListener("click", trackInteraction);
      document.removeEventListener("scroll", trackScroll);
    };
  }, [onTrigger]);
}
