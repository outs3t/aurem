import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import auremIcon from '@/assets/aurem-icon.png';
import {
  Users,
  Package,
  FileText,
  Calculator,
  MessageSquare,
  BarChart3,
  Settings,
  Home,
  Building2,
  User,
  ChevronDown,
  CheckSquare,
  Ticket,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

const clientItems = [
  { title: "Persone Fisiche", url: "/clienti/persone-fisiche", icon: User },
  { title: "Aziende", url: "/clienti/aziende", icon: Building2 },
];

const mainSections = [
  { title: "Task", url: "/task", icon: CheckSquare },
  { title: "Magazzino", url: "/magazzino", icon: Package },
  { title: "Contratti", url: "/contratti", icon: FileText },
  { title: "Preventivi", url: "/preventivi", icon: Calculator },
  { title: "Ticket", url: "/ticket", icon: Ticket },
  { title: "Chat Interna", url: "/chat", icon: MessageSquare },
  { title: "Impostazioni", url: "/impostazioni", icon: Settings },
];

export function CRMSidebar() {
  const { state, setOpen } = useSidebar();
  const [clientsOpen, setClientsOpen] = useState(true);
  const isCollapsed = state === "collapsed";
  const isMobile = useIsMobile();
  const location = useLocation();

  const handleNavClick = () => {
    if (isMobile) {
      setOpen(false);
    }
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    `transition-smooth text-sidebar-foreground ${
      isActive
        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
        : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    }`;

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-gradient-to-b from-sidebar to-sidebar/95">
        {!isCollapsed ? (
          <div className="p-6 border-b border-sidebar-border flex items-center gap-3">
            <img src={auremIcon} alt="Aurem" className="h-12 w-12" />
            <div>
              <h2 className="font-playfair text-2xl font-bold bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
                Aurem
              </h2>
              <p className="text-xs text-muted-foreground">Sistema di gestione</p>
            </div>
          </div>
        ) : (
          <div className="p-3 border-b border-sidebar-border flex justify-center">
            <img src={auremIcon} alt="Aurem" className="h-10 w-10" />
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Principale</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                  <NavLink to={item.url} end className={getNavCls} onClick={handleNavClick}>
                    <item.icon className={`h-5 w-5 ${isCollapsed ? "mx-auto" : "mr-3"}`} />
                    {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Collapsible open={clientsOpen} onOpenChange={setClientsOpen}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md p-2 cursor-pointer flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  {!isCollapsed && "Anagrafica Clienti"}
                </div>
                {!isCollapsed && (
                  <ChevronDown className={`h-4 w-4 transition-transform ${clientsOpen ? "rotate-180" : ""}`} />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {clientItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} className={getNavCls} onClick={handleNavClick}>
                          <item.icon className={`h-4 w-4 ${isCollapsed ? "mx-auto" : "mr-3"}`} />
                          {!isCollapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <SidebarGroup>
          <SidebarGroupLabel>Gestione</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainSections.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                  <NavLink to={item.url} className={getNavCls} onClick={handleNavClick}>
                    <item.icon className={`h-5 w-5 ${isCollapsed ? "mx-auto" : "mr-3"}`} />
                    {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}