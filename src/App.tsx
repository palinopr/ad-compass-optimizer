
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

// Admin-specific pages
import Clients from "./pages/admin/Clients";
import Performance from "./pages/admin/Performance";
import Pipeline from "./pages/admin/Pipeline";

// Meta approval required pages
import PrivacyPolicy from "./pages/PrivacyPolicy";
import DataDeletion from "./pages/DataDeletion";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SidebarProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/events" element={<Events />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/audience" element={<Audience />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/import" element={<Import />} />
            
            {/* Admin routes */}
            <Route path="/clients" element={<Clients />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/pipeline" element={<Pipeline />} />
            
            {/* Meta approval required pages */}
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/data-deletion" element={<DataDeletion />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
