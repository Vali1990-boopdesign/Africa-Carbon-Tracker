import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerServiceWorker, checkInstallPrompt } from "./lib/registerServiceWorker";

registerServiceWorker();
checkInstallPrompt();

createRoot(document.getElementById("root")!).render(<App />);
