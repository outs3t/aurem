import { createContext, useContext, ReactNode } from "react";
import { useUserWorkspaces, useCurrentWorkspace, useWorkspacePermissions, WorkspaceMember, Workspace } from "@/hooks/useWorkspace";
import { WorkspaceOnboarding } from "./WorkspaceOnboarding";
import { Loader2 } from "lucide-react";

interface WorkspaceContextValue {
  workspace: Workspace | null;
  workspaces: Workspace[];
  permissions: WorkspaceMember | null;
  isLoading: boolean;
  setCurrentWorkspace: (id: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspaceContext must be used within WorkspaceProvider");
  }
  return context;
}

interface WorkspaceProviderProps {
  children: ReactNode;
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const { workspace, workspaces, isLoading, setCurrentWorkspace } = useCurrentWorkspace();
  const { data: permissions, isLoading: permissionsLoading } = useWorkspacePermissions();

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Nessun workspace → onboarding
  if (!workspaces || workspaces.length === 0) {
    return (
      <WorkspaceOnboarding 
        onComplete={() => window.location.reload()} 
      />
    );
  }

  return (
    <WorkspaceContext.Provider
      value={{
        workspace: (workspace as Workspace) || null,
        workspaces: (workspaces as Workspace[]) || [],
        permissions: permissions || null,
        isLoading: isLoading || permissionsLoading,
        setCurrentWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
