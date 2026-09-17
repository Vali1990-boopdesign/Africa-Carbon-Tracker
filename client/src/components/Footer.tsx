import { motion } from "framer-motion";

export function Footer() {
  return (
    <motion.footer
      className="mt-auto bg-surface-container/30 border-t border"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Partner Logos */}
        <div className="flex justify-center items-center gap-6 mb-6">
          {/* Catalyst Fund Logo */}
          <div className="bg-white rounded-lg p-2 shadow-lg">
            <img
              src="/catalyst-fund-logo-v2.png"
              alt="Catalyst Fund"
              className="h-8 object-contain"
              width="112"
              height="24"
            />
          </div>

          {/* BFA Global Logo */}
          <div className="bg-white rounded-lg p-2 shadow-lg">
            <img
              src="/bfa-global-logo.png"
              alt="BFA Global"
              className="h-8 object-contain"
              width="112"
              height="24"
            />
          </div>

          {/* FSD Africa Logo */}
          <div className="bg-white rounded-lg p-2 shadow-lg">
            <img
              src="/fsd-africa-logo.png"
              alt="FSD Africa"
              className="h-8 object-contain"
              width="112"
              height="24"
            />
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="text-center space-y-4 text-muted-foreground text-sm max-w-4xl mx-auto">
          <p className="font-medium text-on-surface-variant">Legal Disclaimer</p>
          <p className="leading-relaxed">
            This dashboard analyzes carbon credit retirements from African
            countries, focusing on enterprise-level transactions (ignoring
            credits retired on behalf of individuals). The analysis excludes
            micro-transactions (of 10 or more credits) and maps buyer data to
            parent companies for consistency. While "retirements" and
            "purchases" are used interchangeably for simplicity, not all
            retirements represent direct purchases — some may reflect compliance
            programs. Given Africa's dynamic carbon market landscape, users are
            advised to interpret insights with appropriate caution. For
            instance, pre-purchases of carbon credits yet to be issued (and
            retired) will not be reflected here.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 pt-4">
            <p>
              &copy; 2024 The Catalyst Fund, BFA Global & FSD Africa. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
