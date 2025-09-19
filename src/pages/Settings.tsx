import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Building, Bell, Shield, Palette, Database, Download, Upload, Key, LogOut } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: '',
    role: 'dipendente' as 'admin' | 'manager' | 'dipendente' | 'viewer'
  });
  const [companySettings, setCompanySettings] = useState({
    company_name: 'La Mia Azienda',
    address: '',
    city: '',
    postal_code: '',
    country: 'Italia',
    vat_number: '',
    phone: '',
    email: '',
    website: ''
  });
  const [notifications, setNotifications] = useState({
    email_quotes: true,
    email_contracts: true,
    email_low_stock: true,
    push_notifications: true,
    weekly_reports: false
  });
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
          department: data.department || '',
          role: data.role || 'dipendente'
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Profilo aggiornato con successo",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il profilo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logout effettuato",
        description: "Sei stato disconnesso con successo",
      });
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Errore",
        description: "Errore durante il logout",
        variant: "destructive",
      });
    }
  };

  const exportData = async () => {
    try {
      setLoading(true);
      
      // Simulated data export
      const data = {
        customers: [],
        products: [],
        quotes: [],
        contracts: [],
        exported_at: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `crm_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Successo",
        description: "Dati esportati con successo",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Errore",
        description: "Errore durante l'esportazione",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Impostazioni</h1>
        <p className="text-muted-foreground">Gestisci le impostazioni del tuo account e dell'azienda</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile">Profilo</TabsTrigger>
          <TabsTrigger value="company">Azienda</TabsTrigger>
          <TabsTrigger value="notifications">Notifiche</TabsTrigger>
          <TabsTrigger value="appearance">Aspetto</TabsTrigger>
          <TabsTrigger value="security">Sicurezza</TabsTrigger>
          <TabsTrigger value="data">Dati</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Informazioni Profilo
              </CardTitle>
              <CardDescription>
                Gestisci le tue informazioni personali e di contatto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 mb-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-lg">
                    {profile.first_name.charAt(0)}{profile.last_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">{profile.first_name} {profile.last_name}</h3>
                  <p className="text-muted-foreground">{profile.email}</p>
                  <Badge variant="secondary" className="mt-2 capitalize">{profile.role}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Nome</Label>
                  <Input
                    id="first_name"
                    value={profile.first_name}
                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Cognome</Label>
                  <Input
                    id="last_name"
                    value={profile.last_name}
                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  disabled
                />
                <p className="text-xs text-muted-foreground">L'email non può essere modificata da qui</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefono</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Dipartimento</Label>
                  <Input
                    id="department"
                    value={profile.department}
                    onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={handleUpdateProfile} disabled={loading}>
                {loading ? 'Aggiornamento...' : 'Aggiorna Profilo'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5" />
                Informazioni Azienda
              </CardTitle>
              <CardDescription>
                Gestisci le informazioni della tua azienda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Nome Azienda</Label>
                <Input
                  id="company_name"
                  value={companySettings.company_name}
                  onChange={(e) => setCompanySettings({ ...companySettings, company_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Indirizzo</Label>
                <Textarea
                  id="address"
                  value={companySettings.address}
                  onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                  placeholder="Via, numero civico"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Città</Label>
                  <Input
                    id="city"
                    value={companySettings.city}
                    onChange={(e) => setCompanySettings({ ...companySettings, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code">CAP</Label>
                  <Input
                    id="postal_code"
                    value={companySettings.postal_code}
                    onChange={(e) => setCompanySettings({ ...companySettings, postal_code: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Paese</Label>
                  <Select value={companySettings.country} onValueChange={(value) => setCompanySettings({ ...companySettings, country: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Italia">Italia</SelectItem>
                      <SelectItem value="Francia">Francia</SelectItem>
                      <SelectItem value="Germania">Germania</SelectItem>
                      <SelectItem value="Spagna">Spagna</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vat_number">Partita IVA</Label>
                  <Input
                    id="vat_number"
                    value={companySettings.vat_number}
                    onChange={(e) => setCompanySettings({ ...companySettings, vat_number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_phone">Telefono Azienda</Label>
                  <Input
                    id="company_phone"
                    value={companySettings.phone}
                    onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_email">Email Azienda</Label>
                  <Input
                    id="company_email"
                    type="email"
                    value={companySettings.email}
                    onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Sito Web</Label>
                  <Input
                    id="website"
                    value={companySettings.website}
                    onChange={(e) => setCompanySettings({ ...companySettings, website: e.target.value })}
                    placeholder="https://www.example.com"
                  />
                </div>
              </div>

              <Button disabled={loading}>
                Salva Impostazioni Azienda
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notifiche
              </CardTitle>
              <CardDescription>
                Configura come e quando ricevere le notifiche
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Notifiche Email</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Preventivi</Label>
                    <p className="text-sm text-muted-foreground">Ricevi notifiche per nuovi preventivi e aggiornamenti</p>
                  </div>
                  <Switch
                    checked={notifications.email_quotes}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, email_quotes: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Contratti</Label>
                    <p className="text-sm text-muted-foreground">Notifiche per scadenze e rinnovi contratti</p>
                  </div>
                  <Switch
                    checked={notifications.email_contracts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, email_contracts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Scorte Basse</Label>
                    <p className="text-sm text-muted-foreground">Avvisi quando i prodotti sono sotto scorta minima</p>
                  </div>
                  <Switch
                    checked={notifications.email_low_stock}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, email_low_stock: checked })}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Altre Notifiche</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifiche Push</Label>
                    <p className="text-sm text-muted-foreground">Notifiche desktop nel browser</p>
                  </div>
                  <Switch
                    checked={notifications.push_notifications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, push_notifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Report Settimanali</Label>
                    <p className="text-sm text-muted-foreground">Ricevi un riepilogo settimanale delle attività</p>
                  </div>
                  <Switch
                    checked={notifications.weekly_reports}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, weekly_reports: checked })}
                  />
                </div>
              </div>

              <Button disabled={loading}>
                Salva Preferenze Notifiche
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="mr-2 h-5 w-5" />
                Aspetto
              </CardTitle>
              <CardDescription>
                Personalizza l'aspetto dell'applicazione
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Tema</h4>
                <div className="grid grid-cols-3 gap-4">
                  <Card className={`cursor-pointer ${theme === 'light' ? 'ring-2 ring-primary' : ''}`} onClick={() => setTheme('light')}>
                    <CardContent className="p-4 text-center">
                      <div className="w-full h-16 bg-white border rounded mb-2"></div>
                      <p className="text-sm">Chiaro</p>
                    </CardContent>
                  </Card>
                  <Card className={`cursor-pointer ${theme === 'dark' ? 'ring-2 ring-primary' : ''}`} onClick={() => setTheme('dark')}>
                    <CardContent className="p-4 text-center">
                      <div className="w-full h-16 bg-gray-900 border rounded mb-2"></div>
                      <p className="text-sm">Scuro</p>
                    </CardContent>
                  </Card>
                  <Card className={`cursor-pointer ${theme === 'system' ? 'ring-2 ring-primary' : ''}`} onClick={() => setTheme('system')}>
                    <CardContent className="p-4 text-center">
                      <div className="w-full h-16 bg-gradient-to-r from-white to-gray-900 border rounded mb-2"></div>
                      <p className="text-sm">Sistema</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Sicurezza
              </CardTitle>
              <CardDescription>
                Gestisci la sicurezza del tuo account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Password</h4>
                <Button variant="outline">
                  <Key className="mr-2 h-4 w-4" />
                  Cambia Password
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Sessioni</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <p className="text-sm font-medium">Sessione Corrente</p>
                      <p className="text-xs text-muted-foreground">Chrome su Windows - Ora</p>
                    </div>
                    <Badge variant="secondary">Attiva</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Disconnessione</h4>
                <Button variant="destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Disconnetti da Tutti i Dispositivi
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                Gestione Dati
              </CardTitle>
              <CardDescription>
                Esporta, importa e gestisci i tuoi dati
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Esportazione Dati</h4>
                <p className="text-sm text-muted-foreground">
                  Esporta tutti i tuoi dati in formato JSON per backup o migrazione
                </p>
                <Button onClick={exportData} disabled={loading}>
                  <Download className="mr-2 h-4 w-4" />
                  {loading ? 'Esportazione...' : 'Esporta Tutti i Dati'}
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Importazione Dati</h4>
                <p className="text-sm text-muted-foreground">
                  Importa dati da un file JSON precedentemente esportato
                </p>
                <Button variant="outline" disabled>
                  <Upload className="mr-2 h-4 w-4" />
                  Importa Dati (Prossimamente)
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-destructive">Zona Pericolosa</h4>
                <p className="text-sm text-muted-foreground">
                  Azioni irreversibili che potrebbero compromettere i tuoi dati
                </p>
                <Button variant="destructive" disabled>
                  Elimina Tutti i Dati
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;