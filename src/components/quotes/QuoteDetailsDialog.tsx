import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download, FileText } from 'lucide-react';

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
  customers?: {
    first_name?: string;
    last_name?: string;
    company_name?: string;
  };
}

interface QuoteDetailsDialogProps {
  quote: Quote | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownloadPDF: (quoteId: string) => void;
}

export function QuoteDetailsDialog({ quote, open, onOpenChange, onDownloadPDF }: QuoteDetailsDialogProps) {
  if (!quote) return null;

  const getCustomerName = () => {
    if (!quote.customers) return 'N/A';
    if (quote.customers.company_name) return quote.customers.company_name;
    return `${quote.customers.first_name || ''} ${quote.customers.last_name || ''}`.trim() || 'N/A';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('it-IT');
  };

  const formatCurrency = (amount: number) => {
    return `€${amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <FileText className="h-5 w-5" />
            Dettagli Preventivo
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Numero Preventivo</label>
              <p className="text-lg font-semibold">{quote.quote_number}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Stato</label>
              <div className="mt-1">
                <Badge variant={quote.status === 'accettato' ? 'default' : 'secondary'}>
                  {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <label className="text-sm font-medium text-muted-foreground">Titolo</label>
            <p className="text-base mt-1">{quote.title}</p>
          </div>

          {quote.description && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Descrizione</label>
              <p className="text-base mt-1 text-muted-foreground">{quote.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Cliente</label>
              <p className="text-base mt-1">{getCustomerName()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Data Preventivo</label>
              <p className="text-base mt-1">{formatDate(quote.quote_date)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Valido Fino</label>
              <p className="text-base mt-1">{formatDate(quote.valid_until)}</p>
            </div>
            {quote.payment_terms && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Termini Pagamento</label>
                <p className="text-base mt-1">{quote.payment_terms} giorni</p>
              </div>
            )}
          </div>

          {quote.delivery_terms && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Termini Consegna</label>
              <p className="text-base mt-1">{quote.delivery_terms}</p>
            </div>
          )}

          <Separator />

          <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
            <div className="flex justify-between">
              <span className="text-sm">Subtotale</span>
              <span className="text-sm font-medium">{formatCurrency(quote.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">IVA ({quote.tax_rate}%)</span>
              <span className="text-sm font-medium">{formatCurrency(quote.tax_amount)}</span>
            </div>
            {quote.discount_amount > 0 && (
              <div className="flex justify-between text-destructive">
                <span className="text-sm">Sconto</span>
                <span className="text-sm font-medium">-{formatCurrency(quote.discount_amount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between">
              <span className="text-base font-semibold">Totale</span>
              <span className="text-base font-bold">{formatCurrency(quote.total_amount)}</span>
            </div>
          </div>

          {quote.notes && (
            <>
              <Separator />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Note</label>
                <p className="text-base mt-1 text-muted-foreground whitespace-pre-wrap">{quote.notes}</p>
              </div>
            </>
          )}

          <Separator />

          <div className="flex gap-2">
            <Button onClick={() => onDownloadPDF(quote.id)} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Scarica PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
