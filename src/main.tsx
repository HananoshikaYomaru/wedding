import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./page.tsx";
import RootLayout from "./layout.tsx";

import { scan } from "react-scan"; // must be imported before React and React DOM

if (import.meta.env.DEV) {
  scan({
    enabled: true,
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootLayout>
      <App />
    </RootLayout>
  </StrictMode>,
);
