import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CRMSidebar } from "@/components/sidebar/CRMSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <CRMSidebar />
            <div className="flex-1 flex flex-col">
              <DashboardHeader />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/analytics" element={<div className="p-6"><h1>Analytics - In Sviluppo</h1><p className="text-muted-foreground">Collegare Supabase per funzionalità complete.</p></div>} />
                  <Route path="/clienti/persone-fisiche" element={<div className="p-6"><h1>Persone Fisiche - In Sviluppo</h1><p className="text-muted-foreground">Collegare Supabase per funzionalità complete.</p></div>} />
                  <Route path="/clienti/aziende" element={<div className="p-6"><h1>Aziende - In Sviluppo</h1><p className="text-muted-foreground">Collegare Supabase per funzionalità complete.</p></div>} />
                  <Route path="/magazzino" element={<div className="p-6"><h1>Magazzino - In Sviluppo</h1><p className="text-muted-foreground">Collegare Supabase per funzionalità complete.</p></div>} />
                  <Route path="/contratti" element={<div className="p-6"><h1>Contratti - In Sviluppo</h1><p className="text-muted-foreground">Collegare Supabase per funzionalità complete.</p></div>} />
                  <Route path="/preventivi" element={<div className="p-6"><h1>Preventivi - In Sviluppo</h1><p className="text-muted-foreground">Collegare Supabase per funzionalità complete.</p></div>} />
                  <Route path="/chat" element={<div className="p-6"><h1>Chat Interna - In Sviluppo</h1><p className="text-muted-foreground">Collegare Supabase per funzionalità complete.</p></div>} />
                  <Route path="/impostazioni" element={<div className="p-6"><h1>Impostazioni - In Sviluppo</h1><p className="text-muted-foreground">Collegare Supabase per funzionalità complete.</p></div>} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
