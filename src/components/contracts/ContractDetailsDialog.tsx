import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download, Upload, FileText } from 'lucide-react';

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
  contract_file_url?: string;
  notes?: string;
  customers?: {
    first_name?: string;
    last_name?: string;
    company_name?: string;
  };
}

interface ContractDetailsDialogProps {
  contract: Contract | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadContract: (contractId: string) => void;
}

export function ContractDetailsDialog({ contract, open, onOpenChange, onUploadContract }: ContractDetailsDialogProps) {
  if (!contract) return null;

  const getCustomerName = () => {
    if (!contract.customers) return 'N/A';
    if (contract.customers.company_name) return contract.customers.company_name;
    return `${contract.customers.first_name || ''} ${contract.customers.last_name || ''}`.trim() || 'N/A';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('it-IT');
  };

  const handleDownload = () => {
    if (contract.contract_file_url) {
      window.open(contract.contract_file_url, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <FileText className="h-5 w-5" />
            Dettagli Contratto
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Numero Contratto</label>
              <p className="text-lg font-semibold">{contract.contract_number}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Stato</label>
              <div className="mt-1">
                <Badge variant={contract.status === 'attivo' ? 'default' : 'secondary'}>
                  {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <label className="text-sm font-medium text-muted-foreground">Titolo</label>
            <p className="text-base mt-1">{contract.title}</p>
          </div>

          {contract.description && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Descrizione</label>
              <p className="text-base mt-1 text-muted-foreground">{contract.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Cliente</label>
              <p className="text-base mt-1">{getCustomerName()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tipo Contratto</label>
              <p className="text-base mt-1 capitalize">{contract.contract_type}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Valore Contratto</label>
              <p className="text-base mt-1">
                {contract.contract_value 
                  ? `${contract.contract_value.toLocaleString('it-IT', { minimumFractionDigits: 2 })} ${contract.currency}`
                  : 'N/A'
                }
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Data Firma</label>
              <p className="text-base mt-1">
                {contract.signed_date ? formatDate(contract.signed_date) : 'Non firmato'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Data Inizio</label>
              <p className="text-base mt-1">{formatDate(contract.start_date)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Data Fine</label>
              <p className="text-base mt-1">
                {contract.end_date ? formatDate(contract.end_date) : 'Indeterminato'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Rinnovo Automatico</label>
              <p className="text-base mt-1">{contract.auto_renewal ? 'Sì' : 'No'}</p>
            </div>
            {contract.renewal_notice_days && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Preavviso Rinnovo</label>
                <p className="text-base mt-1">{contract.renewal_notice_days} giorni</p>
              </div>
            )}
          </div>

          {contract.notes && (
            <>
              <Separator />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Note</label>
                <p className="text-base mt-1 text-muted-foreground whitespace-pre-wrap">{contract.notes}</p>
              </div>
            </>
          )}

          <Separator />

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">File Contratto</label>
            <div className="flex gap-2">
              {contract.contract_file_url ? (
                <Button onClick={handleDownload} variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Scarica Contratto
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">Nessun file caricato</p>
              )}
              <Button onClick={() => onUploadContract(contract.id)} variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                {contract.contract_file_url ? 'Sostituisci File' : 'Carica File'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
