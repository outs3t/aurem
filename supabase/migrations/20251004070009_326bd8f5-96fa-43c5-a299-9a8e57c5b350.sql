-- Crea tabella per i ticket
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT NOT NULL UNIQUE,
  customer_type TEXT NOT NULL CHECK (customer_type IN ('persona_fisica', 'azienda')),
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'aperto' CHECK (status IN ('aperto', 'in_lavorazione', 'chiuso')),
  priority TEXT DEFAULT 'normale' CHECK (priority IN ('bassa', 'normale', 'alta', 'urgente')),
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE
);

-- Indici per migliorare le performance
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON public.tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_email ON public.tickets(email);

-- Abilita RLS
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Policy: Chiunque può inserire ticket (pagina pubblica)
CREATE POLICY "anyone_can_create_tickets"
  ON public.tickets
  FOR INSERT
  WITH CHECK (true);

-- Policy: Utenti autenticati possono vedere tutti i ticket
CREATE POLICY "authenticated_users_view_all_tickets"
  ON public.tickets
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Utenti autenticati possono aggiornare i ticket
CREATE POLICY "authenticated_users_update_tickets"
  ON public.tickets
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Solo admin possono eliminare ticket
CREATE POLICY "admins_delete_tickets"
  ON public.tickets
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Trigger per aggiornare updated_at
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Tabella per le risposte ai ticket
CREATE TABLE IF NOT EXISTS public.ticket_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per le risposte
CREATE INDEX IF NOT EXISTS idx_ticket_replies_ticket_id ON public.ticket_replies(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_replies_created_at ON public.ticket_replies(created_at DESC);

-- RLS per le risposte
ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;

-- Policy: Utenti autenticati possono vedere le risposte
CREATE POLICY "authenticated_users_view_replies"
  ON public.ticket_replies
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Utenti autenticati possono creare risposte
CREATE POLICY "authenticated_users_create_replies"
  ON public.ticket_replies
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Funzione per generare numero ticket
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_number TEXT;
  year_month TEXT;
  sequence_num INTEGER;
BEGIN
  year_month := TO_CHAR(NOW(), 'YYYYMM');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(ticket_number FROM '\d+$') AS INTEGER)
  ), 0) + 1
  INTO sequence_num
  FROM public.tickets
  WHERE ticket_number LIKE 'TKT-' || year_month || '-%';
  
  new_number := 'TKT-' || year_month || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN new_number;
END;
$$;