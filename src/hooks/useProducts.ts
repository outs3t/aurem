import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  category_id?: string;
  purchase_price?: number;
  sale_price?: number;
  stock_quantity: number;
  min_stock_level?: number;
  max_stock_level?: number;
  unit_of_measure: string;
  has_serial: boolean;
  supplier?: string;
  brand?: string;
  model?: string;
  weight?: number;
  dimensions?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  product_categories?: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface ProductSerial {
  id: string;
  product_id: string;
  serial_number: string;
  status: string;
  purchase_date?: string;
  purchase_price?: number;
  supplier_invoice?: string;
  warranty_expires?: string;
  sold_to?: string;
  sale_date?: string;
  sale_price?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCategories()]);
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_categories (id, name, description)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare i prodotti',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const createProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      const user = authData?.user;
      if (authError) throw authError;
      if (!user) {
        toast({
          title: 'Accesso richiesto',
          description: 'Devi essere autenticato per creare un prodotto.',
          variant: 'destructive',
        });
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('products')
        .insert([{ ...productData, created_by: user.id }])
        .select(`
          *,
          product_categories (id, name, description)
        `)
        .single();

      if (error) throw error;
      
      setProducts(prev => [data, ...prev]);
      toast({
        title: 'Successo',
        description: 'Prodotto creato con successo',
      });
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile creare il prodotto',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select(`
          *,
          product_categories (id, name, description)
        `)
        .single();

      if (error) throw error;
      
      setProducts(prev => 
        prev.map(product => product.id === id ? { ...product, ...data } : product)
      );
      toast({
        title: 'Successo',
        description: 'Prodotto aggiornato con successo',
      });
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile aggiornare il prodotto',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProducts(prev => prev.filter(product => product.id !== id));
      toast({
        title: 'Successo',
        description: 'Prodotto eliminato con successo',
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare il prodotto',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    products,
    categories,
    loading,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts,
  };
}