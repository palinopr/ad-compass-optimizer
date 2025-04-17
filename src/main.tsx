
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add debug logging to verify rendering process
console.log("🔍 [MAIN] Attempting to render React app");

try {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    console.error("🚨 [MAIN] Root element not found! Check if #root exists in HTML");
    
    // Create emergency root if needed
    const emergencyRoot = document.createElement("div");
    emergencyRoot.id = "emergency-root";
    document.body.appendChild(emergencyRoot);
    
    createRoot(emergencyRoot).render(
      <div style={{ padding: "20px", background: "red", color: "white" }}>
        Root element not found! Emergency rendered.
      </div>
    );
  } else {
    console.log("✅ [MAIN] Root element found, creating React root");
    createRoot(rootElement).render(<App />);
    console.log("✅ [MAIN] React render completed");
  }
} catch (error) {
  console.error("🚨 [MAIN] Error rendering React app:", error);
  
  // Display error on page
  document.body.innerHTML += `
    <div style="padding: 20px; background: #ffdddd; color: #aa0000; margin: 20px; border: 1px solid #cc0000;">
      <h2>React Rendering Error</h2>
      <p>${error instanceof Error ? error.message : "Unknown error"}</p>
    </div>
  `;
}
