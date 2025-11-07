import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerServiceWorker, checkInstallPrompt } from "./lib/registerServiceWorker";
import lottie from "lottie-web";
import { defineElement } from "@lordicon/element";

registerServiceWorker();
checkInstallPrompt();

// Wait for lord-icon script to load before defining custom element
const initializeLordIcon = () => {
  if (typeof window !== 'undefined' && window.lottie) {
    defineElement(lottie.loadAnimation);
    console.log('✅ Lord-icon initialized');
  } else {
    console.warn('⚠️ Lord-icon library not loaded yet, retrying...');
    setTimeout(initializeLordIcon, 100);
  }
};

// Initialize after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeLordIcon);
} else {
  initializeLordIcon();
}

createRoot(document.getElementById("root")!).render(<App />);
