-- =====================================================
-- FIX SECURITY + AGGIORNAMENTO RLS PER MULTI-TENANT
-- =====================================================

-- 1. Fix tickets RLS policies (rimuovi USING true)
DROP POLICY IF EXISTS "authenticated_users_update_tickets" ON public.tickets;
DROP POLICY IF EXISTS "authenticated_users_view_all_tickets" ON public.tickets;

CREATE POLICY "workspace_members_view_tickets"
ON public.tickets FOR SELECT
USING (
  workspace_id IS NULL OR 
  public.is_workspace_member(auth.uid(), workspace_id)
);

CREATE POLICY "workspace_members_update_tickets"
ON public.tickets FOR UPDATE
USING (
  workspace_id IS NULL OR 
  public.can_access_section(auth.uid(), workspace_id, 'tickets', 'edit')
)
WITH CHECK (
  workspace_id IS NULL OR 
  public.can_access_section(auth.uid(), workspace_id, 'tickets', 'edit')
);

-- 2. Aggiorna RLS customers per workspace
DROP POLICY IF EXISTS "authenticated_users_select_customers" ON public.customers;
DROP POLICY IF EXISTS "authenticated_users_insert_customers" ON public.customers;
DROP POLICY IF EXISTS "authenticated_users_update_customers" ON public.customers;
DROP POLICY IF EXISTS "authenticated_users_delete_customers" ON public.customers;

CREATE POLICY "workspace_members_view_customers"
ON public.customers FOR SELECT
USING (
  workspace_id IS NULL OR 
  public.can_access_section(auth.uid(), workspace_id, 'customers', 'view')
);

CREATE POLICY "workspace_members_insert_customers"
ON public.customers FOR INSERT
WITH CHECK (
  workspace_id IS NOT NULL AND
  public.can_access_section(auth.uid(), workspace_id, 'customers', 'edit')
);

CREATE POLICY "workspace_members_update_customers"
ON public.customers FOR UPDATE
USING (public.can_access_section(auth.uid(), workspace_id, 'customers', 'edit'))
WITH CHECK (public.can_access_section(auth.uid(), workspace_id, 'customers', 'edit'));

CREATE POLICY "workspace_members_delete_customers"
ON public.customers FOR DELETE
USING (public.can_access_section(auth.uid(), workspace_id, 'customers', 'admin'));

-- 3. Aggiorna RLS products per workspace
DROP POLICY IF EXISTS "Utenti autenticati possono gestire prodotti" ON public.products;
DROP POLICY IF EXISTS "Utenti autenticati possono vedere prodotti" ON public.products;

CREATE POLICY "workspace_members_view_products"
ON public.products FOR SELECT
USING (
  workspace_id IS NULL OR 
  public.can_access_section(auth.uid(), workspace_id, 'products', 'view')
);

CREATE POLICY "workspace_members_manage_products"
ON public.products FOR ALL
USING (
  workspace_id IS NULL OR 
  public.can_access_section(auth.uid(), workspace_id, 'products', 'edit')
);

-- 4. Aggiorna RLS quotes per workspace
DROP POLICY IF EXISTS "Utenti autenticati possono gestire preventivi" ON public.quotes;
DROP POLICY IF EXISTS "Utenti autenticati possono vedere preventivi" ON public.quotes;

CREATE POLICY "workspace_members_view_quotes"
ON public.quotes FOR SELECT
USING (
  workspace_id IS NULL OR 
  public.can_access_section(auth.uid(), workspace_id, 'quotes', 'view')
);

CREATE POLICY "workspace_members_manage_quotes"
ON public.quotes FOR ALL
USING (
  workspace_id IS NULL OR 
  public.can_access_section(auth.uid(), workspace_id, 'quotes', 'edit')
);

-- 5. Aggiorna RLS contracts per workspace
DROP POLICY IF EXISTS "Utenti autenticati possono gestire contratti" ON public.contracts;
DROP POLICY IF EXISTS "Utenti autenticati possono vedere contratti" ON public.contracts;

CREATE POLICY "workspace_members_view_contracts"
ON public.contracts FOR SELECT
USING (
  workspace_id IS NULL OR 
  public.can_access_section(auth.uid(), workspace_id, 'contracts', 'view')
);

CREATE POLICY "workspace_members_manage_contracts"
ON public.contracts FOR ALL
USING (
  workspace_id IS NULL OR 
  public.can_access_section(auth.uid(), workspace_id, 'contracts', 'edit')
);

-- 6. Aggiorna RLS tasks per workspace
DROP POLICY IF EXISTS "authenticated_users_create_tasks" ON public.tasks;
DROP POLICY IF EXISTS "creators_and_admins_delete_tasks" ON public.tasks;
DROP POLICY IF EXISTS "users_update_own_or_assigned_tasks" ON public.tasks;
DROP POLICY IF EXISTS "users_view_own_or_assigned_tasks" ON public.tasks;

CREATE POLICY "workspace_members_view_tasks"
ON public.tasks FOR SELECT
USING (
  workspace_id IS NULL OR 
  public.can_access_section(auth.uid(), workspace_id, 'tasks', 'view')
);

CREATE POLICY "workspace_members_manage_tasks"
ON public.tasks FOR ALL
USING (
  workspace_id IS NULL OR 
  public.can_access_section(auth.uid(), workspace_id, 'tasks', 'edit')
);

-- 7. Aggiorna RLS stock_movements per workspace
DROP POLICY IF EXISTS "Utenti autenticati possono creare movimenti" ON public.stock_movements;
DROP POLICY IF EXISTS "Utenti autenticati possono vedere movimenti" ON public.stock_movements;

CREATE POLICY "workspace_members_view_stock"
ON public.stock_movements FOR SELECT
USING (
  workspace_id IS NULL OR 
  public.can_access_section(auth.uid(), workspace_id, 'products', 'view')
);

CREATE POLICY "workspace_members_manage_stock"
ON public.stock_movements FOR INSERT
WITH CHECK (
  workspace_id IS NOT NULL AND
  public.can_access_section(auth.uid(), workspace_id, 'products', 'edit')
);

-- 8. Policy per inviti pendenti (utenti non ancora registrati)
CREATE POLICY "Anyone can view pending invites by email"
ON public.workspace_invites FOR SELECT
USING (status = 'pending' AND expires_at > now());