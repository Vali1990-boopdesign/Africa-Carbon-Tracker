import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerServiceWorker, checkInstallPrompt } from "./lib/registerServiceWorker";
import { defineElement } from "@lordicon/element";
import lottie from "lottie-web";

// Initialize Lord Icon custom element with Lottie animation loader
defineElement(lottie.loadAnimation.bind(lottie));

registerServiceWorker();
checkInstallPrompt();

createRoot(document.getElementById("root")!).render(<App />);
