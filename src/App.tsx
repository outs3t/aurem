import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CRMSidebar } from "@/components/sidebar/CRMSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
const queryClient = new QueryClient();

function ProtectedLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center text-muted-foreground">Caricamento…</div>;
  if (!session) return <Navigate to="/auth" replace />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CRMSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/analytics" element={<div className="p-6"><h1>Analytics - In Sviluppo</h1><p className="text-muted-foreground">Collegare Supabase per funzionalità complete.</p></div>} />
              <Route path="/clienti/persone-fisiche" element={<div className="p-6"><h1>Persone Fisiche - In Sviluppo</h1><p className="text-muted-foreground">Collegare Supabase per funzionalità complete.</p></div>} />
              <Route path="/clienti/aziende" element={<div className="p-6"><h1>Aziende - In Sviluppo</h1><p className="text-muted-foreground">Collegare Supabase per funzionalità complete.</p></div>} />
              <Route path="/magazzino" element={<div className="p-6"><h1>Magazzino - In Sviluppo</h1><p className="text-muted-foreground">Collegare Supabase per funzionalità complete.</p></div>} />
              <Route path="/contratti" element={<div className="p-6"><h1>Contratti - In Sviluppo</h1><p className="text-muted-foreground">Collegare Supabase per funzionalità complete.</p></div>} />
              <Route path="/preventivi" element={<div className="p-6"><h1>Preventivi - In Sviluppo</h1><p className="text-muted-foreground">Collegare Supabase per funzionalità complete.</p></div>} />
              <Route path="/chat" element={<div className="p-6"><h1>Chat Interna - In Sviluppo</h1><p className="text-muted-foreground">Collegare Supabase per funzionalità complete.</p></div>} />
              <Route path="/impostazioni" element={<div className="p-6"><h1>Impostazioni - In Sviluppo</h1><p className="text-muted-foreground">Collegare Supabase per funzionalità complete.</p></div>} />
            </Route>
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
