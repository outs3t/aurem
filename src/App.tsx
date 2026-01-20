
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
import Customers from "./pages/Customers";
import Warehouse from "./pages/Warehouse";
import Chat from "./pages/Chat";
import Analytics from "./pages/Analytics";
import Quotes from "./pages/Quotes";
import Contracts from "./pages/Contracts";
import Settings from "./pages/Settings";
import Tasks from "./pages/Tasks";
import Tickets from "./pages/Tickets";
import PublicTicket from "./pages/PublicTicket";
import LandingPage from "./pages/LandingPage";
import GuidePage from "./pages/GuidePage";
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
        
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/guida" element={<GuidePage />} />
            <Route path="/supporto" element={<PublicTicket />} />
            <Route element={<ProtectedLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clienti" element={<Customers />} />
            <Route path="clienti/persone-fisiche" element={<Customers />} />
            <Route path="clienti/aziende" element={<Customers />} />
            <Route path="task" element={<Tasks />} />
            <Route path="magazzino" element={<Warehouse />} />
            <Route path="chat" element={<Chat />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="preventivi" element={<Quotes />} />
            <Route path="contratti" element={<Contracts />} />
            <Route path="ticket" element={<Tickets />} />
            <Route path="impostazioni" element={<Settings />} />
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
