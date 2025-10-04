import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Ticket {
  id: string;
  ticket_number: string;
  customer_type: 'persona_fisica' | 'azienda';
  first_name?: string;
  last_name?: string;
  company_name?: string;
  email: string;
  phone?: string;
  subject: string;
  description: string;
  status: 'aperto' | 'in_lavorazione' | 'chiuso';
  priority: 'bassa' | 'normale' | 'alta' | 'urgente';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
}

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTickets();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('tickets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets'
        },
        () => {
          fetchTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets((data || []) as Ticket[]);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare i ticket',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTicket = async (id: string, updates: Partial<Ticket>) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setTickets(prev =>
        prev.map(ticket => ticket.id === id ? { ...ticket, ...updates } : ticket)
      );

      toast({
        title: 'Successo',
        description: 'Ticket aggiornato con successo',
      });
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile aggiornare il ticket',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteTicket = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTickets(prev => prev.filter(ticket => ticket.id !== id));
      toast({
        title: 'Successo',
        description: 'Ticket eliminato con successo',
      });
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare il ticket',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    tickets,
    loading,
    updateTicket,
    deleteTicket,
    refetch: fetchTickets,
  };
}
