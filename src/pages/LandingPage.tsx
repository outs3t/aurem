import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Users, 
  Package, 
  FileText, 
  Receipt, 
  MessageSquare, 
  BarChart3, 
  Shield, 
  Wifi, 
  WifiOff, 
  Heart, 
  CheckCircle2,
  Smartphone,
  Monitor,
  Cloud,
  Database
} from "lucide-react";
import auremLogo from "@/assets/aurem-logo.png";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const LandingPage = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    // Listen for online/offline
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const features = [
    { icon: Users, title: "Gestione Clienti", description: "Anagrafica completa per persone fisiche e aziende" },
    { icon: Package, title: "Magazzino", description: "Gestione prodotti con numeri seriali e movimenti" },
    { icon: FileText, title: "Contratti", description: "Contratti interni ed esterni con scadenze automatiche" },
    { icon: Receipt, title: "Preventivi", description: "Creazione e invio preventivi professionali" },
    { icon: MessageSquare, title: "Chat Team", description: "Comunicazione interna in tempo reale" },
    { icon: BarChart3, title: "Analytics", description: "Dashboard con metriche e statistiche" },
  ];

  const benefits = [
    { icon: WifiOff, title: "Funziona Offline", description: "Lavora anche senza connessione internet" },
    { icon: Cloud, title: "Sync Cloud", description: "Sincronizzazione automatica quando sei online" },
    { icon: Database, title: "Dati Locali", description: "I tuoi dati salvati anche sul dispositivo" },
    { icon: Shield, title: "Sicuro", description: "Crittografia end-to-end e RLS Supabase" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={auremLogo} alt="Aurem" className="h-10 w-auto" />
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={isOnline ? "default" : "destructive"} className="gap-1">
              {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {isOnline ? "Online" : "Offline"}
            </Badge>
            <Button variant="outline" asChild>
              <a href="/auth">Accedi</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge className="mb-6 bg-blue-600/20 text-blue-300 border-blue-500/30">
          PWA • Installabile • Funziona Offline
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Il CRM che funziona<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            sempre e ovunque
          </span>
        </h1>
        <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
          Sistema gestionale completo per clienti, magazzino, contratti e preventivi. 
          Installalo sul tuo dispositivo e lavora anche offline!
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          {isInstalled ? (
            <Button size="lg" className="gap-2 bg-green-600 hover:bg-green-700" asChild>
              <a href="/auth">
                <CheckCircle2 className="h-5 w-5" />
                App Installata - Apri
              </a>
            </Button>
          ) : isInstallable ? (
            <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={handleInstall}>
              <Download className="h-5 w-5" />
              Installa App (Gratis)
            </Button>
          ) : (
            <div className="space-y-3">
              <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700" asChild>
                <a href="/auth">
                  <Monitor className="h-5 w-5" />
                  Usa nel Browser
                </a>
              </Button>
              <p className="text-sm text-slate-400">
                <Smartphone className="h-4 w-4 inline mr-1" />
                Su mobile: Menu → "Aggiungi a Home"
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
          <span className="flex items-center gap-1">
            <Monitor className="h-4 w-4" /> Desktop
          </span>
          <span className="flex items-center gap-1">
            <Smartphone className="h-4 w-4" /> Mobile
          </span>
          <span className="flex items-center gap-1">
            <WifiOff className="h-4 w-4" /> Offline
          </span>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Tutto quello che ti serve
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
              <CardHeader>
                <feature.icon className="h-10 w-10 text-blue-400 mb-2" />
                <CardTitle className="text-white">{feature.title}</CardTitle>
                <CardDescription className="text-slate-400">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Perché scegliere Aurem CRM
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-blue-500/30 text-center">
              <CardContent className="pt-6">
                <benefit.icon className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-slate-300 text-sm">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Come funziona
        </h2>
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">1</div>
              <div>
                <h3 className="text-lg font-semibold text-white">Installa l'app</h3>
                <p className="text-slate-400">Clicca "Installa" o aggiungi alla home dal menu del browser</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">2</div>
              <div>
                <h3 className="text-lg font-semibold text-white">Crea il tuo account</h3>
                <p className="text-slate-400">Registrati gratuitamente e accedi al sistema</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">3</div>
              <div>
                <h3 className="text-lg font-semibold text-white">Inizia a lavorare</h3>
                <p className="text-slate-400">Gestisci clienti, magazzino e documenti ovunque tu sia</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Donation Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-rose-600/20 to-pink-600/20 border-rose-500/30 max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <Heart className="h-12 w-12 text-rose-400 mx-auto mb-4" />
            <CardTitle className="text-2xl text-white">Supporta il progetto</CardTitle>
            <CardDescription className="text-slate-300 text-base">
              Aurem CRM è gratuito e open source. Se ti è utile, considera una donazione per supportare lo sviluppo continuo.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="flex flex-wrap justify-center gap-3">
              <Button className="bg-rose-600 hover:bg-rose-700" asChild>
                <a href="https://paypal.me/tuopaypal" target="_blank" rel="noopener noreferrer">
                  PayPal
                </a>
              </Button>
              <Button variant="outline" className="border-rose-500/50 text-rose-300 hover:bg-rose-600/20" asChild>
                <a href="https://ko-fi.com/tuokofii" target="_blank" rel="noopener noreferrer">
                  Ko-fi ☕
                </a>
              </Button>
              <Button variant="outline" className="border-rose-500/50 text-rose-300 hover:bg-rose-600/20" asChild>
                <a href="https://github.com/tuouser/aurem" target="_blank" rel="noopener noreferrer">
                  ⭐ GitHub
                </a>
              </Button>
            </div>
            <p className="text-sm text-slate-400 text-center">
              Ogni contributo, anche piccolo, aiuta a mantenere il progetto attivo!
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center text-slate-400">
          <p className="mb-2">© 2024 Aurem CRM. Tutti i diritti riservati.</p>
          <p className="text-sm">
            Fatto con ❤️ per semplificare la gestione aziendale
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
