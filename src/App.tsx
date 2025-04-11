
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Create placeholder pages for our new routes
import Profile from "./pages/Profile";
import Campaigns from "./pages/Campaigns";
import Events from "./pages/Events";
import Analytics from "./pages/Analytics";
import Audience from "./pages/Audience";
import Reports from "./pages/Reports";
import Messages from "./pages/Messages";
import Import from "./pages/Import";
import Contact from "./pages/Contact";

// Admin-specific pages
import Clients from "./pages/admin/Clients";
import Performance from "./pages/admin/Performance";
import Pipeline from "./pages/admin/Pipeline";

// Meta approval required pages
import PrivacyPolicy from "./pages/PrivacyPolicy";
import DataDeletion from "./pages/DataDeletion";
import TermsOfService from "./pages/TermsOfService";

const queryClient = new QueryClient();

// Helper function to create case-insensitive redirect routes
const createCaseInsensitiveRoute = (path, Component) => [
  <Route key={path.toLowerCase()} path={path.toLowerCase()} element={<Component />} />,
  <Route 
    key={path} 
    path={path} 
    element={<Navigate to={path.toLowerCase()} replace />} 
  />
];

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SidebarProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Regular routes with case-insensitive variants */}
            {createCaseInsensitiveRoute("/settings", Settings)}
            {createCaseInsensitiveRoute("/profile", Profile)}
            {createCaseInsensitiveRoute("/campaigns", Campaigns)}
            {createCaseInsensitiveRoute("/events", Events)}
            {createCaseInsensitiveRoute("/analytics", Analytics)}
            {createCaseInsensitiveRoute("/audience", Audience)}
            {createCaseInsensitiveRoute("/reports", Reports)}
            {createCaseInsensitiveRoute("/messages", Messages)}
            {createCaseInsensitiveRoute("/import", Import)}
            {createCaseInsensitiveRoute("/contact", Contact)}
            
            {/* Admin routes with case-insensitive variants */}
            {createCaseInsensitiveRoute("/clients", Clients)}
            {createCaseInsensitiveRoute("/performance", Performance)}
            {createCaseInsensitiveRoute("/pipeline", Pipeline)}
            
            {/* Meta approval required pages with case-insensitive variants */}
            {createCaseInsensitiveRoute("/privacy-policy", PrivacyPolicy)}
            {createCaseInsensitiveRoute("/data-deletion", DataDeletion)}
            {createCaseInsensitiveRoute("/terms-of-service", TermsOfService)}
            {createCaseInsensitiveRoute("/Terms-of-Service", TermsOfService)}
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
