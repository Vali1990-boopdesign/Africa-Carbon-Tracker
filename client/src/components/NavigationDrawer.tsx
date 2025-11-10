import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Sun, Moon, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactModal } from "./ContactModal";
import { useTheme } from "./ThemeProvider";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NavigationDrawer({ isOpen, onClose }: NavigationDrawerProps) {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;

    if (isLeftSwipe) {
      onClose();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Prevent body scroll when drawer is open
  useBodyScrollLock(isOpen);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 z-[70] lg:hidden"
              onClick={onClose}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[85%] max-w-sm bg-surface-container shadow-2xl z-[80] overflow-y-auto lg:hidden"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🌱</span>
                    <div>
                      <h2 className="text-lg font-semibold text-on-surface">
                        Africa Carbon Dashboard
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Analyzing African Carbon Credit Flows and Patterns for
                        Market Intelligence and Policy Insights
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-muted-foreground hover:text-on-surface"
                    data-testid="button-close-drawer"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Content */}
                <div className="flex-1 px-6 py-4 space-y-6">
                  {/* Contact Us */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Get in Touch
                    </h3>
                    <Button
                      onClick={() => {
                        setIsContactOpen(true);
                        onClose();
                      }}
                      className="w-full justify-start gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                      data-testid="button-contact-drawer"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Contact Us
                    </Button>
                  </div>

                  {/* Theme Toggle */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Appearance
                    </h3>
                    <Button
                      onClick={() =>
                        setTheme(theme === "dark" ? "light" : "dark")
                      }
                      variant="outline"
                      className="w-full justify-start gap-2"
                      data-testid="button-theme-toggle"
                    >
                      {theme === "dark" ? (
                        <>
                          <Sun className="h-4 w-4" />
                          Switch to Light Mode
                        </>
                      ) : (
                        <>
                          <Moon className="h-4 w-4" />
                          Switch to Dark Mode
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Partner Organizations */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Partners
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-3">
                        <img
                          src="https://cdn.prod.website-files.com/6704d988d44fef67a9c2878e/6749cd4bf1f583e1b4ab5c5c_%E2%80%8BHorizontal%20logo%2C%20full%20color.png"
                          alt="Catalyst Fund"
                          width="240"
                          height="32"
                          className="h-8 w-full object-contain"
                          onError={(e) => {
                            console.error("Catalyst Fund logo failed to load");
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <img
                          src="/bfa-global-logo.webp"
                          alt="BFA Global"
                          width="238"
                          height="32"
                          className="h-8 w-full object-contain"
                          onError={(e) => {
                            console.error("BFA Global logo failed to load");
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <img
                          src="/fsd-africa-logo.png"
                          alt="FSD Africa"
                          width="122"
                          height="32"
                          className="h-8 w-full object-contain"
                          onError={(e) => {
                            console.error("FSD Africa logo failed to load");
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Legal Disclaimer */}
                  <div className="space-y-2 pb-6">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Legal Disclaimer
                    </h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      This dashboard analyzes carbon credit retirements from
                      African countries, focusing on enterprise-level
                      transactions (ignoring credits retired on behalf of
                      individuals). The analysis excludes micro-transactions (of
                      10 or more credits) and maps buyer data to parent
                      companies for consistency. While "retirements" and
                      "purchases" are used interchangeably for simplicity, not
                      all retirements represent direct purchases — some may
                      reflect compliance programs. Given Africa's dynamic carbon
                      market landscape, users are advised to interpret insights
                      with appropriate caution. For instance, pre-purchases of
                      carbon credits yet to be issued (and retired) will not be
                      reflected here.
                    </p>
                    <p className="text-xs text-muted-foreground pt-2">
                      © 2024 The Catalyst Fund, BFA Global & FSD Africa. All
                      rights reserved.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </>
  );
}

// Hamburger Menu Button Component
export function HamburgerMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="lg:hidden text-muted-foreground hover:text-on-surface"
      data-testid="button-hamburger-menu"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}
