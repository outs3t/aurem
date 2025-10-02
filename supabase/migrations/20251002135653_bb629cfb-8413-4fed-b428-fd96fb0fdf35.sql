-- Fix RLS policies for customers table to prevent unauthorized access

-- Drop existing policies
DROP POLICY IF EXISTS "Utenti autenticati possono aggiornare clienti" ON public.customers;
DROP POLICY IF EXISTS "Utenti autenticati possono creare clienti" ON public.customers;
DROP POLICY IF EXISTS "Utenti autenticati possono vedere clienti" ON public.customers;

-- Ensure RLS is enabled
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owner
ALTER TABLE public.customers FORCE ROW LEVEL SECURITY;

-- Create strict RLS policies that require authentication
CREATE POLICY "authenticated_users_select_customers"
ON public.customers
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "authenticated_users_insert_customers"
ON public.customers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

CREATE POLICY "authenticated_users_update_customers"
ON public.customers
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "authenticated_users_delete_customers"
ON public.customers
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Revoke all public access
REVOKE ALL ON public.customers FROM anon;
REVOKE ALL ON public.customers FROM public;