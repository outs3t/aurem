import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
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
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { WorkspaceSwitcher } from "@/components/workspace/WorkspaceSwitcher";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
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
  const { state, setOpen, setOpenMobile, openMobile } = useSidebar();
  const [clientsOpen, setClientsOpen] = useState(true);
  const isCollapsed = state === "collapsed";
  const isMobile = useIsMobile();
  const location = useLocation();

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center w-full px-3 py-2 rounded-md transition-colors ${
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    }`;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent className="bg-sidebar">
        {/* Workspace Switcher */}
        <div className="p-3 border-b border-sidebar-border">
          {!isCollapsed ? (
            <WorkspaceSwitcher />
          ) : (
            <div className="flex justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-3 py-2">
            Principale
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} end className={getNavCls} onClick={handleNavClick}>
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!isCollapsed && <span className="ml-3">{item.title}</span>}
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
              <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-sidebar-accent rounded-md px-3 py-2 text-xs uppercase tracking-wider text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {!isCollapsed && <span>Clienti</span>}
                </div>
                {!isCollapsed && (
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${clientsOpen ? "rotate-180" : ""}`} />
                )}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {clientItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <NavLink to={item.url} className={getNavCls} onClick={handleNavClick}>
                          <item.icon className="h-4 w-4 shrink-0" />
                          {!isCollapsed && <span className="ml-3">{item.title}</span>}
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
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-3 py-2">
            Gestione
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainSections.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} className={getNavCls} onClick={handleNavClick}>
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!isCollapsed && <span className="ml-3">{item.title}</span>}
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
