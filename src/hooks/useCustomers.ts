import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type CustomerType = 'persona_fisica' | 'azienda';

export interface Customer {
  id: string;
  customer_type: CustomerType;
  first_name?: string;
  last_name?: string;
  codice_fiscale?: string;
  date_of_birth?: string;
  company_name?: string;
  partita_iva?: string;
  codice_sdi?: string;
  legal_form?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  fax?: string;
  website?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  credit_limit?: number;
  payment_terms?: number;
  discount_rate?: number;
  notes?: string;
  tags?: string[];
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const getDeleteDependencies = async (customerId: string) => {
    const [quotesRes, contractsRes, serialsRes] = await Promise.all([
      supabase
        .from('quotes')
        .select('id', { count: 'exact', head: true })
        .eq('customer_id', customerId),
      supabase
        .from('contracts')
        .select('id', { count: 'exact', head: true })
        .eq('customer_id', customerId),
      // Seriali venduti associati al cliente (se usati)
      supabase
        .from('product_serials')
        .select('id', { count: 'exact', head: true })
        .eq('sold_to', customerId),
    ]);

    if (quotesRes.error) throw quotesRes.error;
    if (contractsRes.error) throw contractsRes.error;
    if (serialsRes.error) throw serialsRes.error;

    return {
      quotes: quotesRes.count ?? 0,
      contracts: contractsRes.count ?? 0,
      serials: serialsRes.count ?? 0,
    };
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare i clienti',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      const user = authData?.user;
      if (authError) throw authError;
      if (!user) {
        toast({
          title: 'Accesso richiesto',
          description: 'Devi essere autenticato per creare un cliente.',
          variant: 'destructive',
        });
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('customers')
        .insert([{ ...customerData, created_by: user.id }])
        .select()
        .maybeSingle();

      if (error) throw error;
      
      setCustomers(prev => [data, ...prev]);
      toast({
        title: 'Successo',
        description: 'Cliente creato con successo',
      });
      return data;
    } catch (error) {
      console.error('Error creating customer:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile creare il cliente',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(customerData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setCustomers(prev => 
        prev.map(customer => customer.id === id ? { ...customer, ...data } : customer)
      );
      toast({
        title: 'Successo',
        description: 'Cliente aggiornato con successo',
      });
      return data;
    } catch (error) {
      console.error('Error updating customer:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile aggiornare il cliente',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      const user = authData?.user;
      if (authError) throw authError;
      if (!user) {
        toast({
          title: 'Accesso richiesto',
          description: 'Devi essere autenticato per eliminare un cliente.',
          variant: 'destructive',
        });
        throw new Error('Not authenticated');
      }

      const deps = await getDeleteDependencies(id);
      if (deps.quotes > 0 || deps.contracts > 0 || deps.serials > 0) {
        const parts: string[] = [];
        if (deps.quotes > 0) parts.push(`${deps.quotes} preventivi`);
        if (deps.contracts > 0) parts.push(`${deps.contracts} contratti`);
        if (deps.serials > 0) parts.push(`${deps.serials} seriali venduti`);

        toast({
          title: 'Impossibile eliminare il cliente',
          description: `Questo cliente è collegato a: ${parts.join(', ')}. Elimina prima i record in “Preventivi” e/o “Contratti”.`,
          variant: 'destructive',
        });
        return;
      }

      console.log('Attempting to delete customer with id:', id);
      const { data: deleted, error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        // Se RLS blocca l'operazione, PostgREST può non dare errore ma non cancellare nulla.
        // Chiedendo un RETURNING possiamo verificare che sia stato davvero eliminato.
        .select('id')
        .maybeSingle();

      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }

      if (!deleted?.id) {
        toast({
          title: 'Impossibile eliminare',
          description: 'Il cliente non è stato eliminato (permessi insufficienti o record non trovato).',
          variant: 'destructive',
        });
        return;
      }

      setCustomers(prev => prev.filter(customer => customer.id !== id));
      toast({
        title: 'Successo',
        description: 'Cliente eliminato con successo',
      });
    } catch (error: any) {
      console.error('Error deleting customer:', error);

      // FK / vincoli: 23503 = foreign_key_violation
      const maybeCode = error?.code as string | undefined;
      const fallbackMsg = maybeCode === '23503'
        ? 'Impossibile eliminare: il cliente è collegato ad altri record (es. preventivi/contratti).'
        : (error?.message || 'Impossibile eliminare il cliente');

      toast({
        title: 'Errore',
        description: fallbackMsg,
        variant: 'destructive',
      });
    }
  };

  return {
    customers,
    loading,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    refetch: fetchCustomers,
  };
}