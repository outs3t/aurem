-- Fix security warning: add search_path to function
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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