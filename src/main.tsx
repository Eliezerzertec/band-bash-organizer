import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ensureLegacyMgtCompat } from "./lib/runtimeGuards";
import "./index.css";

ensureLegacyMgtCompat();

createRoot(document.getElementById("root")!).render(<App />);
