-- Fix ultimo warning: tickets INSERT policy
DROP POLICY IF EXISTS "anyone_can_create_tickets" ON public.tickets;

-- I ticket pubblici (supporto) possono essere creati da chiunque MA senza workspace
-- I ticket interni richiedono appartenenza al workspace
CREATE POLICY "public_or_workspace_create_tickets"
ON public.tickets FOR INSERT
WITH CHECK (
  -- Ticket pubblico (senza workspace)
  workspace_id IS NULL
  OR
  -- Ticket interno (con workspace e permessi)
  public.can_access_section(auth.uid(), workspace_id, 'tickets', 'edit')
);