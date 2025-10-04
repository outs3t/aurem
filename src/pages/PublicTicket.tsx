import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function PublicTicket() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    customer_type: 'persona_fisica' as 'persona_fisica' | 'azienda',
    first_name: '',
    last_name: '',
    company_name: '',
    email: '',
    phone: '',
    subject: '',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.customer_type === 'persona_fisica') {
      if (!formData.first_name.trim()) newErrors.first_name = 'Nome obbligatorio';
      if (!formData.last_name.trim()) newErrors.last_name = 'Cognome obbligatorio';
    } else {
      if (!formData.company_name.trim()) newErrors.company_name = 'Ragione sociale obbligatoria';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email obbligatoria';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email non valida';
    }

    if (!formData.phone.trim()) newErrors.phone = 'Telefono obbligatorio';
    if (!formData.subject.trim()) newErrors.subject = 'Oggetto obbligatorio';
    if (!formData.description.trim()) newErrors.description = 'Descrizione obbligatoria';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Errore di validazione',
        description: 'Compila tutti i campi obbligatori',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Generate ticket number
      const { data: ticketNumberData, error: ticketNumberError } = await supabase
        .rpc('generate_ticket_number');

      if (ticketNumberError) throw ticketNumberError;
      const newTicketNumber = ticketNumberData;

      // Create ticket
      const { error: insertError } = await supabase
        .from('tickets')
        .insert([{
          ticket_number: newTicketNumber,
          customer_type: formData.customer_type,
          first_name: formData.customer_type === 'persona_fisica' ? formData.first_name : null,
          last_name: formData.customer_type === 'persona_fisica' ? formData.last_name : null,
          company_name: formData.customer_type === 'azienda' ? formData.company_name : null,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          description: formData.description,
          status: 'aperto',
          priority: 'normale',
        }]);

      if (insertError) throw insertError;

      // Send confirmation email
      const customerName = formData.customer_type === 'persona_fisica' 
        ? `${formData.first_name} ${formData.last_name}`
        : formData.company_name;

      await supabase.functions.invoke('send-ticket-email', {
        body: {
          ticketNumber: newTicketNumber,
          customerName,
          email: formData.email,
          subject: formData.subject,
          description: formData.description,
        },
      });

      setTicketNumber(newTicketNumber);
      setSubmitted(true);

      toast({
        title: 'Ticket inviato!',
        description: `Il tuo ticket ${newTicketNumber} è stato creato con successo`,
      });
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile creare il ticket. Riprova più tardi.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 p-4">
        <Card className="w-full max-w-2xl shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="h-20 w-20 text-green-500" />
            </div>
            <CardTitle className="text-3xl">Ticket Creato con Successo!</CardTitle>
            <CardDescription className="text-lg">
              Il tuo ticket <span className="font-bold text-primary">#{ticketNumber}</span> è stato registrato
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-6 rounded-lg space-y-3">
              <p className="text-center">
                Abbiamo inviato una conferma all'indirizzo <strong>{formData.email}</strong>
              </p>
              <p className="text-center text-muted-foreground">
                Il nostro team ti risponderà entro 24-48 ore lavorative.
              </p>
            </div>
            <Button 
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  customer_type: 'persona_fisica',
                  first_name: '',
                  last_name: '',
                  company_name: '',
                  email: '',
                  phone: '',
                  subject: '',
                  description: '',
                });
              }}
              className="w-full"
            >
              Crea un Nuovo Ticket
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 p-4">
      <Card className="w-full max-w-3xl shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl">Richiedi Assistenza</CardTitle>
          <CardDescription className="text-base">
            Compila il modulo per aprire un ticket di supporto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs 
              value={formData.customer_type} 
              onValueChange={(value: 'persona_fisica' | 'azienda') => 
                setFormData(prev => ({ ...prev, customer_type: value }))
              }
            >
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

              <TabsContent value="persona_fisica" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Nome *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                      className={errors.first_name ? 'border-destructive' : ''}
                    />
                    {errors.first_name && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.first_name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Cognome *</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                      className={errors.last_name ? 'border-destructive' : ''}
                    />
                    {errors.last_name && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.last_name}
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="azienda" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Ragione Sociale *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                    className={errors.company_name ? 'border-destructive' : ''}
                  />
                  {errors.company_name && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.company_name}
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefono *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className={errors.phone ? 'border-destructive' : ''}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Oggetto *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Breve descrizione del problema"
                className={errors.subject ? 'border-destructive' : ''}
              />
              {errors.subject && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.subject}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrizione *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrivi in dettaglio la tua richiesta..."
                rows={5}
                className={errors.description ? 'border-destructive' : ''}
              />
              {errors.description && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.description}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Invio in corso...' : 'Invia Richiesta'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
