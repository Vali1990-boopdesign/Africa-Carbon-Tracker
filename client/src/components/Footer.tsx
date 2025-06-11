import { motion } from "framer-motion";

export function Footer() {
  return (
    <motion.footer
      className="mt-auto bg-gradient-to-t from-gray-900/50 to-transparent border-t border-gray-800"
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
              src="https://cdn.prod.website-files.com/6704d988d44fef67a9c2878e/6749cd4bf1f583e1b4ab5c5c_%E2%80%8BHorizontal%20logo%2C%20full%20color.png"
              alt="Catalyst Fund"
              className="h-8 object-contain"
            />
          </div>
          
          {/* FSD Africa Logo */}
          <div className="bg-white rounded-lg p-2 shadow-lg">
            <img
              src="https://www.fsdafrica.org/wp-content/uploads/2023/05/FSD-Africa-logo.png"
              alt="FSD Africa"
              className="h-8 object-contain"
            />
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="text-center space-y-4 text-gray-400 text-sm max-w-4xl mx-auto">
          <p className="font-medium text-gray-300">
            Legal Disclaimer
          </p>
          <p className="leading-relaxed">
            This dashboard analyzes carbon credit retirements from African countries, focusing on enterprise-level transactions. 
            The analysis excludes micro-transactions and maps buyer data to parent companies for consistency. While "retirements" and "purchases" 
            are used interchangeably for simplicity, not all retirements represent direct purchases — some may reflect compliance programs. 
            Given Africa's dynamic carbon market landscape, users are advised to interpret insights with appropriate caution.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 pt-4 border-t border-gray-700">
            <p>&copy; 2024 The Catalyst Fund. All rights reserved.</p>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}