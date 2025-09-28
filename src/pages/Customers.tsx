import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, User, Building2, Eye, Filter, Tag, Download } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCustomers, Customer, CustomerType } from "@/hooks/useCustomers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Customers() {
  const { customers, loading, createCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<CustomerType | "all">("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<Partial<Customer>>({
    customer_type: 'persona_fisica',
    country: 'Italia',
    active: true,
    tags: []
  });

  // Filtro automatico basato sull'URL  
  useEffect(() => {
    if (location.pathname.includes('/persone-fisiche')) {
      setFilterType('persona_fisica');
    } else if (location.pathname.includes('/aziende')) {
      setFilterType('azienda');
    } else if (location.pathname === '/clienti') {
      setFilterType('all');
    }
  }, [location.pathname]);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || customer.customer_type === filterType;
    
    return matchesSearch && matchesType;
  });

  const resetForm = () => {
    setFormData({
      customer_type: 'persona_fisica',
      country: 'Italia',
      active: true
    });
    setSelectedCustomer(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (selectedCustomer) {
        await updateCustomer(selectedCustomer.id, formData);
      } else {
        await createCustomer(formData as Omit<Customer, 'id' | 'created_at' | 'updated_at'>);
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData(customer);
    setIsDialogOpen(true);
  };

  const handleDelete = async (customerId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo cliente?')) {
      await deleteCustomer(customerId);
    }
  };

  const getCustomerName = (customer: Customer) => {
    if (customer.customer_type === 'azienda') {
      return customer.company_name || 'Nome azienda mancante';
    }
    return `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Nome mancante';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {location.pathname.includes('/persone-fisiche') ? 'Persone Fisiche' :
             location.pathname.includes('/aziende') ? 'Aziende' :
             'Anagrafica Clienti'}
          </h1>
          <p className="text-muted-foreground">
            {location.pathname.includes('/persone-fisiche') ? 'Gestisci clienti privati' :
             location.pathname.includes('/aziende') ? 'Gestisci clienti aziendali' :
             'Gestisci persone fisiche e aziende'}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gap-2">
              <Plus className="h-4 w-4" />
              Nuovo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedCustomer ? 'Modifica Cliente' : 'Nuovo Cliente'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs value={formData.customer_type} onValueChange={(value: CustomerType) => 
                setFormData(prev => ({ ...prev, customer_type: value }))
              }>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="persona_fisica" className="gap-2">
                    <User className="h-4 w-4" />
                    Persona Fisica
                  </TabsTrigger>
                  <TabsTrigger value="azienda" className="gap-2">
                    <Building2 className="h-4 w-4" />
                    Azienda
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="persona_fisica" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">Nome *</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Cognome *</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="codice_fiscale">Codice Fiscale</Label>
                      <Input
                        id="codice_fiscale"
                        value={formData.codice_fiscale || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, codice_fiscale: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="date_of_birth">Data di Nascita</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={formData.date_of_birth || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="azienda" className="space-y-4">
                  <div>
                    <Label htmlFor="company_name">Ragione Sociale *</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="partita_iva">Partita IVA</Label>
                      <Input
                        id="partita_iva"
                        value={formData.partita_iva || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, partita_iva: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="codice_sdi">Codice SDI</Label>
                      <Input
                        id="codice_sdi"
                        value={formData.codice_sdi || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, codice_sdi: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="legal_form">Forma Giuridica</Label>
                      <Select value={formData.legal_form || ''} onValueChange={(value) => 
                        setFormData(prev => ({ ...prev, legal_form: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="srl">SRL</SelectItem>
                          <SelectItem value="spa">SPA</SelectItem>
                          <SelectItem value="snc">SNC</SelectItem>
                          <SelectItem value="sas">SAS</SelectItem>
                          <SelectItem value="ditta_individuale">Ditta Individuale</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Dati comuni */}
              <div className="space-y-4">
                <h4 className="font-semibold">Contatti</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefono</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="mobile">Cellulare</Label>
                    <Input
                      id="mobile"
                      value={formData.mobile || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fax">Fax</Label>
                    <Input
                      id="fax"
                      value={formData.fax || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, fax: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Sito Web</Label>
                    <Input
                      id="website"
                      value={formData.website || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    />
                  </div>
                </div>

                <h4 className="font-semibold">Indirizzo</h4>
                <div>
                  <Label htmlFor="address">Indirizzo</Label>
                  <Input
                    id="address"
                    value={formData.address || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="city">Città</Label>
                    <Input
                      id="city"
                      value={formData.city || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="province">Provincia</Label>
                    <Input
                      id="province"
                      value={formData.province || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, province: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="postal_code">CAP</Label>
                    <Input
                      id="postal_code"
                      value={formData.postal_code || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Paese</Label>
                    <Input
                      id="country"
                      value={formData.country || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    />
                  </div>
                </div>

                <h4 className="font-semibold">Dati Commerciali</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="credit_limit">Fido (€)</Label>
                    <Input
                      id="credit_limit"
                      type="number"
                      step="0.01"
                      value={formData.credit_limit || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, credit_limit: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="payment_terms">Termini Pagamento (gg)</Label>
                    <Input
                      id="payment_terms"
                      type="number"
                      value={formData.payment_terms || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, payment_terms: parseInt(e.target.value) || 30 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="discount_rate">Sconto (%)</Label>
                    <Input
                      id="discount_rate"
                      type="number"
                      step="0.01"
                      value={formData.discount_rate || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount_rate: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      placeholder="Separati da virgola (es: VIP, Fornitore)"
                      value={formData.tags?.join(', ') || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Note</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annulla
                </Button>
                <Button type="submit">
                  {selectedCustomer ? 'Aggiorna' : 'Crea'} Cliente
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiche */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Persone Fisiche</p>
                <p className="text-2xl font-bold">
                  {customers.filter(c => c.customer_type === 'persona_fisica').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Aziende</p>
                <p className="text-2xl font-bold">
                  {customers.filter(c => c.customer_type === 'azienda').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Attivi</p>
                <p className="text-2xl font-bold">
                  {customers.filter(c => c.active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Con Tags</p>
                <p className="text-2xl font-bold">
                  {customers.filter(c => c.tags && c.tags.length > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtri e Ricerca */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cerca clienti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={(value: CustomerType | "all") => setFilterType(value)}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i clienti</SelectItem>
                <SelectItem value="persona_fisica">Persone fisiche</SelectItem>
                <SelectItem value="azienda">Aziende</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Esporta
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista Clienti */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Clienti ({filteredCustomers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">Caricamento...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Nome/Ragione Sociale</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefono</TableHead>
                  <TableHead>Città</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <Badge variant={customer.customer_type === 'azienda' ? 'default' : 'secondary'}>
                        {customer.customer_type === 'azienda' ? (
                          <><Building2 className="h-3 w-3 mr-1" />Azienda</>
                        ) : (
                          <><User className="h-3 w-3 mr-1" />Persona</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{getCustomerName(customer)}</TableCell>
                    <TableCell>{customer.email || '-'}</TableCell>
                    <TableCell>{customer.phone || customer.mobile || '-'}</TableCell>
                    <TableCell>{customer.city || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {customer.tags && customer.tags.length > 0 ? (
                          customer.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                        {customer.tags && customer.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{customer.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.active ? 'default' : 'secondary'}>
                        {customer.active ? 'Attivo' : 'Non Attivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(customer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(customer.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}