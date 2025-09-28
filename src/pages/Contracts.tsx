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
import { Plus, Search, FileText, Edit, Trash2, Eye, Download, Calendar, AlertTriangle } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Contract {
  id: string;
  contract_number: string;
  title: string;
  description?: string;
  contract_type: string;
  contract_value?: number;
  currency: string;
  status: string;
  start_date: string;
  end_date?: string;
  signed_date?: string;
  auto_renewal: boolean;
  renewal_notice_days?: number;
  customer_id?: string;
  employee_id?: string;
  contract_file_url?: string;
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

const Contracts = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  const [newContract, setNewContract] = useState({
    contract_number: '',
    title: '',
    description: '',
    contract_type: 'esterno' as 'esterno' | 'interno',
    contract_value: 0,
    currency: 'EUR',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    auto_renewal: false,
    renewal_notice_days: 30,
    customer_id: '',
    notes: ''
  });

  useEffect(() => {
    fetchContracts();
    fetchCustomers();
  }, []);

  const fetchContracts = async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
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
      setContracts(data || []);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i contratti",
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

  const generateContractNumber = () => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CTR-${year}${month}-${random}`;
  };

  const handleCreateContract = async () => {
    try {
      const contractData = {
        ...newContract,
        contract_number: newContract.contract_number || generateContractNumber(),
        status: 'bozza',
        customer_id: newContract.customer_id || null // Fix: Convert empty string to null
      };

      const { error } = await supabase
        .from('contracts')
        .insert([contractData] as any);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Contratto creato con successo",
      });

      setIsDialogOpen(false);
      resetForm();
      fetchContracts();
    } catch (error) {
      console.error('Error creating contract:', error);
      toast({
        title: "Errore",
        description: "Impossibile creare il contratto",
        variant: "destructive",
      });
    }
  };

  const handleUpdateContract = async () => {
    if (!editingContract) return;

    try {
      const { error } = await supabase
        .from('contracts')
        .update(newContract)
        .eq('id', editingContract.id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Contratto aggiornato con successo",
      });

      setIsDialogOpen(false);
      setEditingContract(null);
      resetForm();
      fetchContracts();
    } catch (error) {
      console.error('Error updating contract:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il contratto",
        variant: "destructive",
      });
    }
  };

  const handleDeleteContract = async (contractId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo contratto?')) return;

    try {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', contractId);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Contratto eliminato con successo",
      });

      fetchContracts();
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il contratto",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setNewContract({
      contract_number: '',
      title: '',
      description: '',
      contract_type: 'esterno' as 'esterno' | 'interno',
      contract_value: 0,
      currency: 'EUR',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      auto_renewal: false,
      renewal_notice_days: 30,
      customer_id: '',
      notes: ''
    });
  };

  const openEditDialog = (contract: Contract) => {
    setEditingContract(contract);
    setNewContract({
      contract_number: contract.contract_number,
      title: contract.title,
      description: contract.description || '',
      contract_type: (contract.contract_type as 'esterno' | 'interno') || 'esterno',
      contract_value: contract.contract_value || 0,
      currency: contract.currency,
      start_date: contract.start_date,
      end_date: contract.end_date || '',
      auto_renewal: contract.auto_renewal,
      renewal_notice_days: contract.renewal_notice_days || 30,
      customer_id: contract.customer_id || '',
      notes: contract.notes || ''
    });
    setIsDialogOpen(true);
  };

  const getStatusBadge = (contract: Contract) => {
    const today = new Date();
    const endDate = contract.end_date ? new Date(contract.end_date) : null;
    const isExpiring = endDate && (endDate.getTime() - today.getTime()) <= (30 * 24 * 60 * 60 * 1000); // 30 giorni

    const statusConfig = {
      bozza: { label: 'Bozza', variant: 'secondary' as const },
      attivo: { label: 'Attivo', variant: 'default' as const },
      scaduto: { label: 'Scaduto', variant: 'destructive' as const },
      terminato: { label: 'Terminato', variant: 'secondary' as const },
      sospeso: { label: 'Sospeso', variant: 'secondary' as const }
    };

    const config = statusConfig[contract.status as keyof typeof statusConfig] || { label: contract.status, variant: 'secondary' as const };
    
    return (
      <div className="flex items-center space-x-2">
        <Badge variant={config.variant}>{config.label}</Badge>
        {isExpiring && contract.status === 'attivo' && (
          <Badge variant="destructive" className="flex items-center">
            <AlertTriangle className="h-3 w-3 mr-1" />
            In scadenza
          </Badge>
        )}
      </div>
    );
  };

  const getCustomerName = (customer: any) => {
    if (!customer) return 'N/A';
    if (customer.company_name) return customer.company_name;
    return `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'N/A';
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.contract_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getCustomerName(contract.customers).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    
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
          <h1 className="text-3xl font-bold">Contratti</h1>
          <p className="text-muted-foreground">Gestisci contratti e accordi commerciali</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingContract(null); }}>
              <Plus className="mr-2 h-4 w-4" />
              Nuovo Contratto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingContract ? 'Modifica Contratto' : 'Nuovo Contratto'}</DialogTitle>
              <DialogDescription>
                {editingContract ? 'Modifica i dettagli del contratto' : 'Compila i dettagli per creare un nuovo contratto'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contract_number">Numero Contratto</Label>
                  <Input
                    id="contract_number"
                    placeholder="Auto-generato se vuoto"
                    value={newContract.contract_number}
                    onChange={(e) => setNewContract({ ...newContract, contract_number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contract_type">Tipo Contratto</Label>
                  <Select value={newContract.contract_type} onValueChange={(value) => setNewContract({ ...newContract, contract_type: value as 'esterno' | 'interno' })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="esterno">Esterno</SelectItem>
                      <SelectItem value="interno">Interno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Titolo</Label>
                <Input
                  id="title"
                  value={newContract.title}
                  onChange={(e) => setNewContract({ ...newContract, title: e.target.value })}
                  placeholder="Titolo del contratto"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrizione</Label>
                <Textarea
                  id="description"
                  value={newContract.description}
                  onChange={(e) => setNewContract({ ...newContract, description: e.target.value })}
                  placeholder="Descrizione dettagliata del contratto"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_id">Cliente</Label>
                <Select value={newContract.customer_id} onValueChange={(value) => setNewContract({ ...newContract, customer_id: value })}>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contract_value">Valore Contratto</Label>
                  <Input
                    id="contract_value"
                    type="number"
                    step="0.01"
                    value={newContract.contract_value}
                    onChange={(e) => setNewContract({ ...newContract, contract_value: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Valuta</Label>
                  <Select value={newContract.currency} onValueChange={(value) => setNewContract({ ...newContract, currency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="USD">Dollaro ($)</SelectItem>
                      <SelectItem value="GBP">Sterlina (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Data Inizio</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={newContract.start_date}
                    onChange={(e) => setNewContract({ ...newContract, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">Data Fine</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={newContract.end_date}
                    onChange={(e) => setNewContract({ ...newContract, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    id="auto_renewal"
                    type="checkbox"
                    checked={newContract.auto_renewal}
                    onChange={(e) => setNewContract({ ...newContract, auto_renewal: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="auto_renewal">Rinnovo Automatico</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="renewal_notice_days">Giorni Preavviso Rinnovo</Label>
                  <Input
                    id="renewal_notice_days"
                    type="number"
                    value={newContract.renewal_notice_days}
                    onChange={(e) => setNewContract({ ...newContract, renewal_notice_days: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Note</Label>
                <Textarea
                  id="notes"
                  value={newContract.notes}
                  onChange={(e) => setNewContract({ ...newContract, notes: e.target.value })}
                  placeholder="Note aggiuntive"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annulla
              </Button>
              <Button onClick={editingContract ? handleUpdateContract : handleCreateContract}>
                {editingContract ? 'Aggiorna' : 'Crea'} Contratto
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista Contratti</CardTitle>
          <CardDescription>
            Tutti i contratti e accordi commerciali
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca contratti..."
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
                <SelectItem value="attivo">Attivo</SelectItem>
                <SelectItem value="scaduto">Scaduto</SelectItem>
                <SelectItem value="terminato">Terminato</SelectItem>
                <SelectItem value="sospeso">Sospeso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numero</TableHead>
                <TableHead>Titolo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valore</TableHead>
                <TableHead>Scadenza</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">{contract.contract_number}</TableCell>
                  <TableCell>{contract.title}</TableCell>
                  <TableCell>{getCustomerName(contract.customers)}</TableCell>
                  <TableCell className="capitalize">{contract.contract_type}</TableCell>
                  <TableCell>
                    {contract.contract_value ? 
                      `${contract.contract_value.toLocaleString('it-IT', { minimumFractionDigits: 2 })} ${contract.currency}` 
                      : 'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    {contract.end_date ? (
                      <div>
                        <div>{new Date(contract.end_date).toLocaleDateString('it-IT')}</div>
                        {contract.status === 'attivo' && (
                          <div className="text-xs text-muted-foreground">
                            {getDaysUntilExpiry(contract.end_date) > 0 
                              ? `${getDaysUntilExpiry(contract.end_date)} giorni`
                              : 'Scaduto'
                            }
                          </div>
                        )}
                      </div>
                    ) : 'N/A'}
                  </TableCell>
                  <TableCell>{getStatusBadge(contract)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(contract)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteContract(contract.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredContracts.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nessun contratto trovato</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? "Nessun contratto corrisponde ai criteri di ricerca"
                  : "Inizia creando il tuo primo contratto"
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={() => { resetForm(); setEditingContract(null); setIsDialogOpen(true); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crea Primo Contratto
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Contracts;