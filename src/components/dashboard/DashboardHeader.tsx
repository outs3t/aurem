import { Bell, Search, User, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import auremLogo from '@/assets/aurem-logo.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function DashboardHeader() {
  const { setTheme, theme } = useTheme();
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(3);
  const [notifications, setNotifications] = useState<Array<{ id: number; title: string; desc: string; time: string }>>([
    { id: 1, title: "Contratto in scadenza", desc: "Cliente Rossi Spa – 7 giorni", time: "2h" },
    { id: 2, title: "Nuovo lead", desc: "Mario Bianchi ha richiesto informazioni", time: "4h" },
    { id: 3, title: "Magazzino basso", desc: "Articolo ABC-123 sotto scorta minima", time: "1g" },
  ]);

  useEffect(() => {
    if (notifOpen && notifCount > 0) setNotifCount(0);
  }, [notifOpen, notifCount]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <SidebarTrigger className="mr-4" />
        
        {/* Logo e Nome Aurem */}
        <div className="flex items-center gap-3 mr-6">
          <img src={auremLogo} alt="Aurem Logo" className="h-10 w-10" />
          <h1 className="font-playfair text-2xl font-bold bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 bg-clip-text text-transparent tracking-wide">
            Aurem
          </h1>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-4">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cerca clienti, contratti, prodotti..."
                className="pl-10 bg-muted/50"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Notifiche */}
            <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {notifCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive">
                      {notifCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifiche</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">Nessuna notifica</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="px-3 py-2 hover:bg-muted/60 rounded-md transition-smooth">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.desc}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
                    </div>
                  ))
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setNotifications([])}>Segna tutto come letto</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Toggle Tema */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              onClick={toggleTheme}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Utente */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      U
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Utente Admin</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      admin@azienda.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate('/impostazioni')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profilo</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate('/impostazioni')}>
                  <span>Impostazioni</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout}>
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
