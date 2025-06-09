
import { motion } from "framer-motion";

export function Footer() {
  return (
    <motion.footer
      className="mt-16 border-t border-gray-700 bg-dark-950/80 backdrop-blur-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Catalyst Fund Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/catalyst-fund-logo.png"
            alt="Catalyst Fund"
            className="h-16 object-contain"
          />
        </div>

        {/* Legal Disclaimer */}
        <div className="text-center space-y-4 text-gray-400 text-sm max-w-4xl mx-auto">
          <p className="font-medium text-gray-300">
            Legal Disclaimer
          </p>
          <p className="leading-relaxed">
            This dashboard is based on data from the Berkeley Carbon Trading Project's Voluntary Registry Offsets Database (pre-2000s to 2024). 
            The analysis focuses on carbon credit retirements from African countries, excluding micro-transactions. While "retirements" and "purchases" 
            are used interchangeably for simplicity, not all retirements represent direct purchases — some may reflect compliance programs, 
            such as South Africa's carbon tax. Buyer data reflects enterprise-level initiatives and is mapped to parent companies or headquarters 
            for consistency. Given Africa's dynamic carbon market landscape, the data used extensively to clean and categorize data, 
            users are advised to interpret insights with appropriate caution.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 pt-4 border-t border-gray-700">
            <p>&copy; 2024 Berkeley Carbon Trading Project. All rights reserved.</p>
            <p>Powered by Catalyst Fund</p>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
