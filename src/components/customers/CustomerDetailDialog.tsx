import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Building2, Mail, Phone, MapPin, CreditCard, Calendar, Tag, Edit } from 'lucide-react';
import { Customer } from '@/hooks/useCustomers';

interface CustomerDetailDialogProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (customer: Customer) => void;
}

export function CustomerDetailDialog({ customer, open, onOpenChange, onEdit }: CustomerDetailDialogProps) {
  if (!customer) return null;

  const isCompany = customer.customer_type === 'azienda';
  const customerName = isCompany ? customer.company_name : `${customer.first_name} ${customer.last_name}`;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/D';
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '€0,00';
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                {isCompany ? <Building2 className="h-5 w-5" /> : <User className="h-5 w-5" />}
                Dettagli Cliente
              </DialogTitle>
              <DialogDescription>
                Visualizza tutti i dettagli del cliente {customerName}
              </DialogDescription>
            </div>
            <Button onClick={() => onEdit(customer)} className="gap-2">
              <Edit className="h-4 w-4" />
              Modifica
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informazioni Principali */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isCompany ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
                Informazioni {isCompany ? 'Azienda' : 'Personali'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nome</p>
                <p className="font-semibold">{customerName}</p>
              </div>
              
              {isCompany ? (
                <>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Partita IVA</p>
                    <p>{customer.partita_iva || 'N/D'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Codice SDI</p>
                    <p>{customer.codice_sdi || 'N/D'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Forma Giuridica</p>
                    <p className="capitalize">{customer.legal_form || 'N/D'}</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Codice Fiscale</p>
                    <p>{customer.codice_fiscale || 'N/D'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Data di Nascita</p>
                    <p>{formatDate(customer.date_of_birth)}</p>
                  </div>
                </>
              )}

              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipo Cliente</p>
                <Badge variant={isCompany ? 'default' : 'secondary'}>
                  {isCompany ? 'Azienda' : 'Persona Fisica'}
                </Badge>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Stato</p>
                <Badge variant={customer.active ? 'default' : 'secondary'}>
                  {customer.active ? 'Attivo' : 'Inattivo'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Contatti */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Contatti
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{customer.email || 'N/D'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Telefono</p>
                  <p>{customer.phone || 'N/D'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cellulare</p>
                  <p>{customer.mobile || 'N/D'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fax</p>
                  <p>{customer.fax || 'N/D'}</p>
                </div>
              </div>

              {customer.website && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sito Web</p>
                  <a href={customer.website} target="_blank" rel="noopener noreferrer" 
                     className="text-blue-600 hover:underline">
                    {customer.website}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Indirizzo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Indirizzo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Indirizzo</p>
                <p>{customer.address || 'N/D'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Città</p>
                  <p>{customer.city || 'N/D'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Provincia</p>
                  <p>{customer.province || 'N/D'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CAP</p>
                  <p>{customer.postal_code || 'N/D'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Paese</p>
                  <p>{customer.country || 'N/D'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dati Commerciali */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Dati Commerciali
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fido</p>
                <p className="font-semibold text-green-600">
                  {formatCurrency(customer.credit_limit)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Termini di Pagamento</p>
                <p>{customer.payment_terms || 30} giorni</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sconto</p>
                <p>{customer.discount_rate || 0}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tags e Note */}
        {(customer.tags && customer.tags.length > 0) || customer.notes ? (
          <div className="space-y-4">
            <Separator />
            
            {customer.tags && customer.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {customer.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {customer.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Note</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{customer.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}

        {/* Info Creazione */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Creato il {formatDate(customer.created_at)}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Aggiornato il {formatDate(customer.updated_at)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}