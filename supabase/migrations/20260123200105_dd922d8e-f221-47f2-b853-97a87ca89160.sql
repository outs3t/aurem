-- =====================================================
-- SISTEMA MULTI-TENANT CON WORKSPACE E PERMESSI GRANULARI
-- =====================================================

-- 1. Enum per i permessi per sezione
CREATE TYPE public.permission_level AS ENUM ('none', 'view', 'edit', 'admin');

-- 2. Tabella Workspace (Azienda)
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  owner_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabella membri workspace con permessi granulari
CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  -- Permessi per sezione
  perm_customers permission_level NOT NULL DEFAULT 'none',
  perm_products permission_level NOT NULL DEFAULT 'none',
  perm_quotes permission_level NOT NULL DEFAULT 'none',
  perm_contracts permission_level NOT NULL DEFAULT 'none',
  perm_tickets permission_level NOT NULL DEFAULT 'none',
  perm_tasks permission_level NOT NULL DEFAULT 'none',
  perm_chat permission_level NOT NULL DEFAULT 'none',
  perm_analytics permission_level NOT NULL DEFAULT 'none',
  perm_settings permission_level NOT NULL DEFAULT 'none',
  is_owner BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

-- 4. Tabella inviti
CREATE TABLE public.workspace_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID NOT NULL,
  -- Permessi che verranno assegnati all'accettazione
  perm_customers permission_level NOT NULL DEFAULT 'view',
  perm_products permission_level NOT NULL DEFAULT 'view',
  perm_quotes permission_level NOT NULL DEFAULT 'view',
  perm_contracts permission_level NOT NULL DEFAULT 'view',
  perm_tickets permission_level NOT NULL DEFAULT 'view',
  perm_tasks permission_level NOT NULL DEFAULT 'view',
  perm_chat permission_level NOT NULL DEFAULT 'view',
  perm_analytics permission_level NOT NULL DEFAULT 'view',
  perm_settings permission_level NOT NULL DEFAULT 'none',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, email)
);

-- 5. Aggiungere workspace_id a tutte le tabelle dati
ALTER TABLE public.customers ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.products ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.product_categories ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.product_serials ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.quotes ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.quote_items ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.contracts ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.stock_movements ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.tasks ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.tickets ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.chat_rooms ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.notifications ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- 6. Funzione helper per verificare membership e permessi
CREATE OR REPLACE FUNCTION public.get_user_workspace_permission(
  _user_id UUID,
  _workspace_id UUID,
  _section TEXT
) RETURNS permission_level
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  perm permission_level;
BEGIN
  EXECUTE format(
    'SELECT perm_%s FROM public.workspace_members WHERE user_id = $1 AND workspace_id = $2',
    _section
  ) INTO perm USING _user_id, _workspace_id;
  
  RETURN COALESCE(perm, 'none'::permission_level);
END;
$$;

-- 7. Funzione per verificare se utente è membro di un workspace
CREATE OR REPLACE FUNCTION public.is_workspace_member(_user_id UUID, _workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE user_id = _user_id AND workspace_id = _workspace_id
  );
$$;

-- 8. Funzione per verificare se utente può accedere a una sezione
CREATE OR REPLACE FUNCTION public.can_access_section(
  _user_id UUID,
  _workspace_id UUID,
  _section TEXT,
  _min_level permission_level DEFAULT 'view'
) RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_perm permission_level;
  levels permission_level[] := ARRAY['none', 'view', 'edit', 'admin']::permission_level[];
BEGIN
  user_perm := public.get_user_workspace_permission(_user_id, _workspace_id, _section);
  
  RETURN array_position(levels, user_perm) >= array_position(levels, _min_level);
END;
$$;

-- 9. Funzione per verificare se utente è owner del workspace
CREATE OR REPLACE FUNCTION public.is_workspace_owner(_user_id UUID, _workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE user_id = _user_id AND workspace_id = _workspace_id AND is_owner = true
  );
$$;

-- 10. Enable RLS su nuove tabelle
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_invites ENABLE ROW LEVEL SECURITY;

-- 11. RLS Policies per workspaces
CREATE POLICY "Members can view their workspaces"
ON public.workspaces FOR SELECT
USING (public.is_workspace_member(auth.uid(), id));

CREATE POLICY "Authenticated users can create workspaces"
ON public.workspaces FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());

CREATE POLICY "Owners can update their workspaces"
ON public.workspaces FOR UPDATE
USING (public.is_workspace_owner(auth.uid(), id));

CREATE POLICY "Owners can delete their workspaces"
ON public.workspaces FOR DELETE
USING (public.is_workspace_owner(auth.uid(), id));

-- 12. RLS Policies per workspace_members
CREATE POLICY "Members can view workspace members"
ON public.workspace_members FOR SELECT
USING (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Owners/admins can manage members"
ON public.workspace_members FOR ALL
USING (
  public.is_workspace_owner(auth.uid(), workspace_id) OR
  public.can_access_section(auth.uid(), workspace_id, 'settings', 'admin')
);

-- 13. RLS Policies per workspace_invites
CREATE POLICY "Members can view workspace invites"
ON public.workspace_invites FOR SELECT
USING (
  public.is_workspace_member(auth.uid(), workspace_id) OR
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

CREATE POLICY "Admins can create invites"
ON public.workspace_invites FOR INSERT
WITH CHECK (
  public.is_workspace_owner(auth.uid(), workspace_id) OR
  public.can_access_section(auth.uid(), workspace_id, 'settings', 'admin')
);

CREATE POLICY "Users can update their own invites"
ON public.workspace_invites FOR UPDATE
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- 14. Trigger per updated_at
CREATE TRIGGER update_workspaces_updated_at
BEFORE UPDATE ON public.workspaces
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 15. Indici per performance
CREATE INDEX idx_workspace_members_user ON public.workspace_members(user_id);
CREATE INDEX idx_workspace_members_workspace ON public.workspace_members(workspace_id);
CREATE INDEX idx_workspace_invites_email ON public.workspace_invites(email);
CREATE INDEX idx_customers_workspace ON public.customers(workspace_id);
CREATE INDEX idx_products_workspace ON public.products(workspace_id);
CREATE INDEX idx_quotes_workspace ON public.quotes(workspace_id);
CREATE INDEX idx_contracts_workspace ON public.contracts(workspace_id);
CREATE INDEX idx_tasks_workspace ON public.tasks(workspace_id);
CREATE INDEX idx_tickets_workspace ON public.tickets(workspace_id);