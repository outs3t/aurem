import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type PermissionLevel = 'none' | 'view' | 'edit' | 'admin';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  perm_customers: PermissionLevel;
  perm_products: PermissionLevel;
  perm_quotes: PermissionLevel;
  perm_contracts: PermissionLevel;
  perm_tickets: PermissionLevel;
  perm_tasks: PermissionLevel;
  perm_chat: PermissionLevel;
  perm_analytics: PermissionLevel;
  perm_settings: PermissionLevel;
  is_owner: boolean;
  joined_at: string;
}

export interface WorkspaceInvite {
  id: string;
  workspace_id: string;
  email: string;
  invited_by: string;
  perm_customers: PermissionLevel;
  perm_products: PermissionLevel;
  perm_quotes: PermissionLevel;
  perm_contracts: PermissionLevel;
  perm_tickets: PermissionLevel;
  perm_tasks: PermissionLevel;
  perm_chat: PermissionLevel;
  perm_analytics: PermissionLevel;
  perm_settings: PermissionLevel;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expires_at: string;
  created_at: string;
  workspace?: Workspace;
}

// Hook per ottenere i workspace dell'utente corrente
export function useUserWorkspaces() {
  return useQuery({
    queryKey: ['user-workspaces'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          workspace_id,
          is_owner,
          workspaces:workspace_id (
            id,
            name,
            slug,
            logo_url,
            owner_id,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      return data?.map(m => ({
        ...(m.workspaces as unknown as Workspace),
        is_owner: m.is_owner
      })) || [];
    },
  });
}

// Hook per ottenere il workspace attivo (salvato in localStorage)
export function useCurrentWorkspace() {
  const { data: workspaces, isLoading } = useUserWorkspaces();
  
  const currentWorkspaceId = localStorage.getItem('currentWorkspaceId');
  
  const currentWorkspace = workspaces?.find(w => w.id === currentWorkspaceId) || workspaces?.[0];
  
  const setCurrentWorkspace = (workspaceId: string) => {
    localStorage.setItem('currentWorkspaceId', workspaceId);
    window.location.reload();
  };

  return {
    workspace: currentWorkspace,
    workspaces,
    isLoading,
    setCurrentWorkspace,
  };
}

// Hook per ottenere i permessi dell'utente nel workspace corrente
export function useWorkspacePermissions() {
  const { workspace } = useCurrentWorkspace();

  return useQuery({
    queryKey: ['workspace-permissions', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return null;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', workspace.id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data as WorkspaceMember;
    },
    enabled: !!workspace?.id,
  });
}

// Hook per verificare permesso su una sezione
export function useCanAccess(section: string, minLevel: PermissionLevel = 'view') {
  const { data: permissions, isLoading } = useWorkspacePermissions();
  
  if (isLoading) return { canAccess: false, isLoading: true };
  if (!permissions) return { canAccess: false, isLoading: false };
  
  const levels: PermissionLevel[] = ['none', 'view', 'edit', 'admin'];
  const permKey = `perm_${section}` as keyof WorkspaceMember;
  const userLevel = permissions[permKey] as PermissionLevel;
  
  const canAccess = levels.indexOf(userLevel) >= levels.indexOf(minLevel);
  
  return { canAccess, isLoading: false, permission: userLevel };
}

// Helper per generare slug univoco
async function generateUniqueSlug(baseName: string): Promise<string> {
  const baseSlug = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Verifica se lo slug esiste già
  const { data: existing } = await supabase
    .from('workspaces')
    .select('slug')
    .like('slug', `${baseSlug}%`);
  
  if (!existing || existing.length === 0) {
    return baseSlug;
  }
  
  // Trova il prossimo numero disponibile
  const existingSlugs = new Set(existing.map(w => w.slug));
  
  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }
  
  let counter = 2;
  while (existingSlugs.has(`${baseSlug}-${counter}`)) {
    counter++;
  }
  
  return `${baseSlug}-${counter}`;
}

// Hook per creare un nuovo workspace
export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non autenticato');

      // Genera slug univoco
      const uniqueSlug = await generateUniqueSlug(name);

      // Crea workspace
      const { data: workspace, error: wsError } = await supabase
        .from('workspaces')
        .insert({
          name,
          slug: uniqueSlug,
          owner_id: user.id,
        })
        .select()
        .single();

      if (wsError) throw wsError;

      // Aggiungi utente come owner con tutti i permessi
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspace.id,
          user_id: user.id,
          is_owner: true,
          perm_customers: 'admin',
          perm_products: 'admin',
          perm_quotes: 'admin',
          perm_contracts: 'admin',
          perm_tickets: 'admin',
          perm_tasks: 'admin',
          perm_chat: 'admin',
          perm_analytics: 'admin',
          perm_settings: 'admin',
        });

      if (memberError) throw memberError;

      // Salva come workspace corrente
      localStorage.setItem('currentWorkspaceId', workspace.id);

      return workspace;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-workspaces'] });
      toast.success('Azienda creata con successo!');
    },
    onError: (error: Error) => {
      toast.error(`Errore: ${error.message}`);
    },
  });
}

// Hook per ottenere inviti pendenti per l'utente
export function usePendingInvites() {
  return useQuery({
    queryKey: ['pending-invites'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('workspace_invites')
        .select(`
          *,
          workspaces:workspace_id (
            id,
            name,
            slug,
            logo_url
          )
        `)
        .eq('email', user.email)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString());

      if (error) throw error;
      return data as (WorkspaceInvite & { workspaces: Workspace })[];
    },
  });
}

// Hook per accettare un invito
export function useAcceptInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non autenticato');

      // Ottieni l'invito
      const { data: invite, error: inviteError } = await supabase
        .from('workspace_invites')
        .select('*')
        .eq('id', inviteId)
        .single();

      if (inviteError) throw inviteError;

      // Crea membership con i permessi dell'invito
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: invite.workspace_id,
          user_id: user.id,
          perm_customers: invite.perm_customers,
          perm_products: invite.perm_products,
          perm_quotes: invite.perm_quotes,
          perm_contracts: invite.perm_contracts,
          perm_tickets: invite.perm_tickets,
          perm_tasks: invite.perm_tasks,
          perm_chat: invite.perm_chat,
          perm_analytics: invite.perm_analytics,
          perm_settings: invite.perm_settings,
        });

      if (memberError) throw memberError;

      // Aggiorna stato invito
      const { error: updateError } = await supabase
        .from('workspace_invites')
        .update({ status: 'accepted' })
        .eq('id', inviteId);

      if (updateError) throw updateError;

      // Imposta come workspace corrente
      localStorage.setItem('currentWorkspaceId', invite.workspace_id);

      return invite;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['pending-invites'] });
      toast.success('Invito accettato!');
    },
    onError: (error: Error) => {
      toast.error(`Errore: ${error.message}`);
    },
  });
}

// Hook per creare un invito
export function useCreateInvite() {
  const queryClient = useQueryClient();
  const { workspace } = useCurrentWorkspace();

  return useMutation({
    mutationFn: async (inviteData: {
      email: string;
      permissions: Partial<Record<string, PermissionLevel>>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !workspace) throw new Error('Non autenticato');

      const { error } = await supabase
        .from('workspace_invites')
        .insert({
          workspace_id: workspace.id,
          email: inviteData.email.toLowerCase(),
          invited_by: user.id,
          perm_customers: inviteData.permissions.customers || 'view',
          perm_products: inviteData.permissions.products || 'view',
          perm_quotes: inviteData.permissions.quotes || 'view',
          perm_contracts: inviteData.permissions.contracts || 'view',
          perm_tickets: inviteData.permissions.tickets || 'view',
          perm_tasks: inviteData.permissions.tasks || 'view',
          perm_chat: inviteData.permissions.chat || 'view',
          perm_analytics: inviteData.permissions.analytics || 'view',
          perm_settings: inviteData.permissions.settings || 'none',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-invites'] });
      toast.success('Invito inviato!');
    },
    onError: (error: Error) => {
      toast.error(`Errore: ${error.message}`);
    },
  });
}

// Hook per ottenere il workspace_id corrente (per le query)
export function useWorkspaceId() {
  const { workspace } = useCurrentWorkspace();
  return workspace?.id;
}
