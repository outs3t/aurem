import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Eye, Trash2, AlertCircle, Clock, CheckCircle2, User, Building2 } from 'lucide-react';
import { useTickets } from '@/hooks/useTickets';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function Tickets() {
  const { tickets, loading, updateTicket, deleteTicket } = useTickets();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.first_name && ticket.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.last_name && ticket.last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.company_name && ticket.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const config = {
      aperto: { label: 'Aperto', variant: 'default' as const, icon: AlertCircle },
      in_lavorazione: { label: 'In Lavorazione', variant: 'secondary' as const, icon: Clock },
      chiuso: { label: 'Chiuso', variant: 'outline' as const, icon: CheckCircle2 },
    };
    const { label, variant, icon: Icon } = config[status as keyof typeof config] || config.aperto;
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const config = {
      bassa: { label: 'Bassa', className: 'bg-blue-100 text-blue-700' },
      normale: { label: 'Normale', className: 'bg-gray-100 text-gray-700' },
      alta: { label: 'Alta', className: 'bg-orange-100 text-orange-700' },
      urgente: { label: 'Urgente', className: 'bg-red-100 text-red-700' },
    };
    const { label, className } = config[priority as keyof typeof config] || config.normale;
    return <Badge className={className}>{label}</Badge>;
  };

  const getCustomerName = (ticket: any) => {
    if (ticket.customer_type === 'azienda') {
      return ticket.company_name || 'N/A';
    }
    return `${ticket.first_name || ''} ${ticket.last_name || ''}`.trim() || 'N/A';
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      await updateTicket(ticketId, { status: newStatus as any });
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const handleDelete = async (ticketId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo ticket?')) {
      await deleteTicket(ticketId);
    }
  };

  const handleViewDetail = (ticket: any) => {
    setSelectedTicket(ticket);
    setIsDetailOpen(true);
  };

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
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Ticket di Supporto</h1>
          <p className="text-muted-foreground">Gestisci le richieste dei clienti</p>
        </div>
        <Card className="md:w-auto">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-destructive">{tickets.filter(t => t.status === 'aperto').length}</div>
                <div className="text-xs text-muted-foreground">Aperti</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-500">{tickets.filter(t => t.status === 'in_lavorazione').length}</div>
                <div className="text-xs text-muted-foreground">In Lavorazione</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">{tickets.filter(t => t.status === 'chiuso').length}</div>
                <div className="text-xs text-muted-foreground">Chiusi</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Elenco Ticket</CardTitle>
          <CardDescription>Visualizza e gestisci tutti i ticket ricevuti</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca per numero, oggetto, cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                <SelectItem value="aperto">Aperto</SelectItem>
                <SelectItem value="in_lavorazione">In Lavorazione</SelectItem>
                <SelectItem value="chiuso">Chiuso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numero</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Oggetto</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Priorità</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nessun ticket trovato
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono font-medium">{ticket.ticket_number}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {ticket.customer_type === 'azienda' ? (
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <User className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div>
                            <div className="font-medium">{getCustomerName(ticket)}</div>
                            <div className="text-xs text-muted-foreground">{ticket.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{ticket.subject}</TableCell>
                      <TableCell>
                        <Select
                          value={ticket.status}
                          onValueChange={(value) => handleStatusChange(ticket.id, value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="aperto">Aperto</SelectItem>
                            <SelectItem value="in_lavorazione">In Lavorazione</SelectItem>
                            <SelectItem value="chiuso">Chiuso</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(ticket.created_at), 'dd MMM yyyy', { locale: it })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(ticket.created_at), 'HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetail(ticket)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(ticket.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Dettaglio Ticket
              <Badge variant="outline">{selectedTicket?.ticket_number}</Badge>
            </DialogTitle>
            <DialogDescription>
              Informazioni complete sulla richiesta del cliente
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Cliente</div>
                  <div className="mt-1 flex items-center gap-2">
                    {selectedTicket.customer_type === 'azienda' ? (
                      <Building2 className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    <span className="font-medium">{getCustomerName(selectedTicket)}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Stato</div>
                  <div className="mt-1">{getStatusBadge(selectedTicket.status)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Email</div>
                  <div className="mt-1">{selectedTicket.email}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Telefono</div>
                  <div className="mt-1">{selectedTicket.phone || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Priorità</div>
                  <div className="mt-1">{getPriorityBadge(selectedTicket.priority)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Data Creazione</div>
                  <div className="mt-1">
                    {format(new Date(selectedTicket.created_at), 'dd MMMM yyyy HH:mm', { locale: it })}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">Oggetto</div>
                <div className="mt-1 font-medium">{selectedTicket.subject}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">Descrizione</div>
                <div className="mt-1 p-4 bg-muted rounded-lg whitespace-pre-wrap">
                  {selectedTicket.description}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
