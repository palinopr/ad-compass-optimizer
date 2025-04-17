
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

console.log("🔍 [MAIN] Attempting to render React app");

const rootElement = document.getElementById("root");

if (rootElement) {
  console.log("✅ [MAIN] Root element found, creating React root");
  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("✅ [MAIN] React render completed");
} else {
  console.error("🚨 [MAIN] Root element not found!");
  
  // Create an emergency div if root is missing
  const emergencyRoot = document.createElement("div");
  emergencyRoot.id = "emergency-root";
  document.body.appendChild(emergencyRoot);
  
  createRoot(emergencyRoot).render(
    <div style={{ padding: "20px", background: "red", color: "white" }}>
      Root element not found! Emergency rendered.
    </div>
  );
}
