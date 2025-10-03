import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type TaskStatus = 'da_fare' | 'in_corso' | 'completata' | 'annullata';
export type TaskPriority = 'bassa' | 'media' | 'alta' | 'urgente';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to: string | null;
  created_by: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('priority', { ascending: false })
        .order('due_date', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare le task',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, first_name, last_name, email')
        .order('first_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const createTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'completed_at' | 'created_by'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non autenticato');

      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...taskData, created_by: user.id }])
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => [...prev, data]);
      toast({
        title: 'Successo',
        description: 'Task creata con successo',
      });

      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile creare la task',
        variant: 'destructive',
      });
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      // Se cambia lo stato in completata, aggiungi completed_at
      if (updates.status === 'completata' && !updates.completed_at) {
        updates.completed_at = new Date().toISOString();
      }
      // Se cambia da completata a altro stato, rimuovi completed_at
      if (updates.status && updates.status !== 'completata') {
        updates.completed_at = null;
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => prev.map(t => t.id === id ? data : t));
      toast({
        title: 'Successo',
        description: 'Task aggiornata con successo',
      });

      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile aggiornare la task',
        variant: 'destructive',
      });
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTasks(prev => prev.filter(t => t.id !== id));
      toast({
        title: 'Successo',
        description: 'Task eliminata con successo',
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare la task',
        variant: 'destructive',
      });
    }
  };

  return {
    tasks,
    users,
    loading,
    createTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks,
  };
}
