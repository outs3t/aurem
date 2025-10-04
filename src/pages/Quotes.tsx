import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, FileText, Edit, Trash2, Eye, Download, Calendar, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { QuoteDetailsDialog } from '@/components/quotes/QuoteDetailsDialog';

interface Quote {
  id: string;
  quote_number: string;
  title: string;
  description?: string;
  customer_id: string;
  quote_date: string;
  valid_until: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  status: string;
  payment_terms?: number;
  delivery_terms?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  customers?: {
    first_name?: string;
    last_name?: string;
    company_name?: string;
  };
}

interface Customer {
  id: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  customer_type: string;
}

const Quotes = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingQuote, setViewingQuote] = useState<Quote | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();

  const [newQuote, setNewQuote] = useState({
    quote_number: '',
    title: '',
    description: '',
    customer_id: '',
    quote_date: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    subtotal: 0,
    tax_rate: 22,
    discount_amount: 0,
    payment_terms: 30,
    delivery_terms: '',
    notes: ''
  });

  useEffect(() => {
    fetchQuotes();
    fetchCustomers();
  }, []);

  const fetchQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          customers (
            first_name,
            last_name,
            company_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i preventivi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, first_name, last_name, company_name, customer_type')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const generateQuoteNumber = () => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PRV-${year}${month}-${random}`;
  };

  const handleCreateQuote = async () => {
    try {
      const quoteData = {
        ...newQuote,
        quote_number: newQuote.quote_number || generateQuoteNumber(),
        tax_amount: (newQuote.subtotal * newQuote.tax_rate) / 100,
        total_amount: newQuote.subtotal + (newQuote.subtotal * newQuote.tax_rate) / 100 - newQuote.discount_amount,
        status: 'bozza'
      };

      const { error } = await supabase
        .from('quotes')
        .insert([quoteData]);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Preventivo creato con successo",
      });

      setIsDialogOpen(false);
      resetForm();
      fetchQuotes();
    } catch (error) {
      console.error('Error creating quote:', error);
      toast({
        title: "Errore",
        description: "Impossibile creare il preventivo",
        variant: "destructive",
      });
    }
  };

  const handleUpdateQuote = async () => {
    if (!editingQuote) return;

    try {
      const { error } = await supabase
        .from('quotes')
        .update(newQuote)
        .eq('id', editingQuote.id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Preventivo aggiornato con successo",
      });

      setIsDialogOpen(false);
      setEditingQuote(null);
      resetForm();
      fetchQuotes();
    } catch (error) {
      console.error('Error updating quote:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il preventivo",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuote = async (quoteId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo preventivo?')) return;

    try {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', quoteId);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Preventivo eliminato con successo",
      });

      fetchQuotes();
    } catch (error) {
      console.error('Error deleting quote:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il preventivo",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (quoteId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ status: newStatus })
        .eq('id', quoteId);

      if (error) throw error;

      toast({
        title: "Successo",
        description: `Stato aggiornato a: ${newStatus}`,
      });

      fetchQuotes();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare lo stato",
        variant: "destructive",
      });
    }
  };

  const handleViewQuote = (quote: Quote) => {
    setViewingQuote(quote);
    setIsViewDialogOpen(true);
  };

  const handleDownloadPDF = async (quoteId: string) => {
    try {
      // TODO: Implementare generazione PDF
      toast({
        title: "Informazione",
        description: "Funzionalità download PDF in fase di implementazione.",
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Errore",
        description: "Impossibile scaricare il PDF",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setNewQuote({
      quote_number: '',
      title: '',
      description: '',
      customer_id: '',
      quote_date: new Date().toISOString().split('T')[0],
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subtotal: 0,
      tax_rate: 22,
      discount_amount: 0,
      payment_terms: 30,
      delivery_terms: '',
      notes: ''
    });
  };

  const openEditDialog = (quote: Quote) => {
    setEditingQuote(quote);
    setNewQuote({
      quote_number: quote.quote_number,
      title: quote.title,
      description: quote.description || '',
      customer_id: quote.customer_id,
      quote_date: quote.quote_date,
      valid_until: quote.valid_until,
      subtotal: quote.subtotal,
      tax_rate: quote.tax_rate,
      discount_amount: quote.discount_amount,
      payment_terms: quote.payment_terms || 30,
      delivery_terms: quote.delivery_terms || '',
      notes: quote.notes || ''
    });
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      bozza: { label: 'Bozza', variant: 'secondary' as const },
      inviato: { label: 'Inviato', variant: 'default' as const },
      accettato: { label: 'Accettato', variant: 'default' as const },
      rifiutato: { label: 'Rifiutato', variant: 'destructive' as const },
      scaduto: { label: 'Scaduto', variant: 'secondary' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCustomerName = (customer: any) => {
    if (!customer) return 'N/A';
    if (customer.company_name) return customer.company_name;
    return `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'N/A';
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getCustomerName(quote.customers).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Preventivi</h1>
          <p className="text-muted-foreground">Gestisci preventivi e offerte commerciali</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingQuote(null); }}>
              <Plus className="mr-2 h-4 w-4" />
              Nuovo Preventivo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingQuote ? 'Modifica Preventivo' : 'Nuovo Preventivo'}</DialogTitle>
              <DialogDescription>
                {editingQuote ? 'Modifica i dettagli del preventivo' : 'Compila i dettagli per creare un nuovo preventivo'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quote_number">Numero Preventivo</Label>
                  <Input
                    id="quote_number"
                    placeholder="Auto-generato se vuoto"
                    value={newQuote.quote_number}
                    onChange={(e) => setNewQuote({ ...newQuote, quote_number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_id">Cliente</Label>
                  <Select value={newQuote.customer_id} onValueChange={(value) => setNewQuote({ ...newQuote, customer_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.company_name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Titolo</Label>
                <Input
                  id="title"
                  value={newQuote.title}
                  onChange={(e) => setNewQuote({ ...newQuote, title: e.target.value })}
                  placeholder="Titolo del preventivo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrizione</Label>
                <Textarea
                  id="description"
                  value={newQuote.description}
                  onChange={(e) => setNewQuote({ ...newQuote, description: e.target.value })}
                  placeholder="Descrizione dettagliata"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quote_date">Data Preventivo</Label>
                  <Input
                    id="quote_date"
                    type="date"
                    value={newQuote.quote_date}
                    onChange={(e) => setNewQuote({ ...newQuote, quote_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valid_until">Valido Fino</Label>
                  <Input
                    id="valid_until"
                    type="date"
                    value={newQuote.valid_until}
                    onChange={(e) => setNewQuote({ ...newQuote, valid_until: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subtotal">Subtotale (€)</Label>
                  <Input
                    id="subtotal"
                    type="number"
                    step="0.01"
                    value={newQuote.subtotal}
                    onChange={(e) => setNewQuote({ ...newQuote, subtotal: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax_rate">IVA (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    step="0.01"
                    value={newQuote.tax_rate}
                    onChange={(e) => setNewQuote({ ...newQuote, tax_rate: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount_amount">Sconto (€)</Label>
                  <Input
                    id="discount_amount"
                    type="number"
                    step="0.01"
                    value={newQuote.discount_amount}
                    onChange={(e) => setNewQuote({ ...newQuote, discount_amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_terms">Termini Pagamento (giorni)</Label>
                  <Input
                    id="payment_terms"
                    type="number"
                    value={newQuote.payment_terms}
                    onChange={(e) => setNewQuote({ ...newQuote, payment_terms: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery_terms">Termini Consegna</Label>
                  <Input
                    id="delivery_terms"
                    value={newQuote.delivery_terms}
                    onChange={(e) => setNewQuote({ ...newQuote, delivery_terms: e.target.value })}
                    placeholder="Es. 10 giorni lavorativi"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Note</Label>
                <Textarea
                  id="notes"
                  value={newQuote.notes}
                  onChange={(e) => setNewQuote({ ...newQuote, notes: e.target.value })}
                  placeholder="Note aggiuntive"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annulla
              </Button>
              <Button onClick={editingQuote ? handleUpdateQuote : handleCreateQuote}>
                {editingQuote ? 'Aggiorna' : 'Crea'} Preventivo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista Preventivi</CardTitle>
          <CardDescription>
            Tutti i preventivi creati
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca preventivi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i stati</SelectItem>
                <SelectItem value="bozza">Bozza</SelectItem>
                <SelectItem value="inviato">Inviato</SelectItem>
                <SelectItem value="accettato">Accettato</SelectItem>
                <SelectItem value="rifiutato">Rifiutato</SelectItem>
                <SelectItem value="scaduto">Scaduto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numero</TableHead>
                <TableHead>Titolo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Totale</TableHead>
                <TableHead>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">{quote.quote_number}</TableCell>
                  <TableCell>{quote.title}</TableCell>
                  <TableCell>{getCustomerName(quote.customers)}</TableCell>
                  <TableCell>{new Date(quote.quote_date).toLocaleDateString('it-IT')}</TableCell>
                  <TableCell>{getStatusBadge(quote.status)}</TableCell>
                  <TableCell>€{quote.total_amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewQuote(quote)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(quote)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDownloadPDF(quote.id)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleStatusChange(quote.id, 'bozza')}>
                            Segna come Bozza
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(quote.id, 'inviato')}>
                            Segna come Inviato
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(quote.id, 'accettato')}>
                            Segna come Accettato
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(quote.id, 'rifiutato')}>
                            Segna come Rifiutato
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(quote.id, 'scaduto')}>
                            Segna come Scaduto
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteQuote(quote.id)} className="text-destructive">
                            Elimina
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredQuotes.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nessun preventivo trovato</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? "Nessun preventivo corrisponde ai criteri di ricerca"
                  : "Inizia creando il tuo primo preventivo"
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={() => { resetForm(); setEditingQuote(null); setIsDialogOpen(true); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crea Primo Preventivo
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <QuoteDetailsDialog 
        quote={viewingQuote}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        onDownloadPDF={handleDownloadPDF}
      />
    </div>
  );
};

export default Quotes;