import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Database,
  Github,
  BookOpen,
  Play,
  Code,
  Server,
  HardDrive,
  Globe,
  Lock,
  Zap,
  Coffee
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
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

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
    { icon: Users, title: "Gestione Clienti", description: "Anagrafica completa per persone fisiche e aziende con tutti i dati fiscali italiani (P.IVA, CF, SDI)" },
    { icon: Package, title: "Magazzino", description: "Gestione prodotti con numeri seriali, movimenti di carico/scarico, scorte minime e categorie" },
    { icon: FileText, title: "Contratti", description: "Contratti interni (dipendenti) ed esterni (clienti) con scadenze, rinnovi automatici e upload documenti" },
    { icon: Receipt, title: "Preventivi", description: "Creazione preventivi professionali con righe prodotto, sconti, IVA e generazione PDF" },
    { icon: MessageSquare, title: "Chat Team", description: "Sistema di messaggistica interna in tempo reale per comunicare con il team" },
    { icon: BarChart3, title: "Analytics", description: "Dashboard con metriche, grafici e statistiche sull'andamento aziendale" },
  ];

  const techStack = [
    { name: "React 18", description: "Framework UI moderno" },
    { name: "TypeScript", description: "Tipizzazione statica" },
    { name: "Vite", description: "Build tool velocissimo" },
    { name: "Tailwind CSS", description: "Styling utility-first" },
    { name: "shadcn/ui", description: "Componenti UI accessibili" },
    { name: "Supabase", description: "Backend PostgreSQL + Auth" },
    { name: "TanStack Query", description: "Data fetching & caching" },
    { name: "PWA", description: "Installabile + Offline" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-50 bg-slate-900/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={auremLogo} alt="Aurem" className="h-10 w-auto" />
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-slate-300 hover:text-white transition-colors">Funzionalità</a>
            <a href="#transparency" className="text-slate-300 hover:text-white transition-colors">Trasparenza</a>
            <a href="#guide" className="text-slate-300 hover:text-white transition-colors">Guida</a>
            <a href="#donate" className="text-slate-300 hover:text-white transition-colors">Supporta</a>
          </nav>
          <div className="flex items-center gap-3">
            <Badge variant={isOnline ? "default" : "destructive"} className="gap-1">
              {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {isOnline ? "Online" : "Offline"}
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <Badge className="mb-6 bg-blue-600/20 text-blue-300 border-blue-500/30">
          Open Source • Gratuito • PWA • Funziona Offline
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Aurem CRM<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            Gestionale Aziendale Completo
          </span>
        </h1>
        <p className="text-xl text-slate-300 mb-10 max-w-3xl mx-auto">
          Sistema CRM italiano open source per gestire clienti, magazzino, contratti e preventivi. 
          Installabile come app nativa, funziona anche offline. 
          <strong className="text-white"> 100% gratuito, 100% trasparente.</strong>
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Button size="lg" className="gap-2 bg-green-600 hover:bg-green-700 text-lg px-8" asChild>
            <Link to="/auth">
              <Play className="h-5 w-5" />
              Prova la Demo
            </Link>
          </Button>
          
          {isInstalled ? (
            <Button size="lg" variant="outline" className="gap-2 border-green-500 text-green-400" asChild>
              <Link to="/auth">
                <CheckCircle2 className="h-5 w-5" />
                App Installata
              </Link>
            </Button>
          ) : isInstallable ? (
            <Button size="lg" variant="outline" className="gap-2" onClick={handleInstall}>
              <Download className="h-5 w-5" />
              Installa App
            </Button>
          ) : (
            <Button size="lg" variant="outline" className="gap-2" asChild>
              <Link to="/guida">
                <BookOpen className="h-5 w-5" />
                Leggi la Guida
              </Link>
            </Button>
          )}
        </div>

        <Card className="max-w-md mx-auto bg-amber-500/10 border-amber-500/30">
          <CardContent className="pt-4 pb-4">
            <p className="text-amber-300 text-sm font-medium">
              🔐 <strong>Credenziali Demo:</strong><br />
              Email: <code className="bg-black/30 px-2 py-0.5 rounded">demo@aurem.it</code><br />
              Password: <code className="bg-black/30 px-2 py-0.5 rounded">Demo1234!@#$</code>
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-4">
          Funzionalità Complete
        </h2>
        <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
          Tutto quello che ti serve per gestire la tua attività, senza costi nascosti
        </p>
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

      {/* Transparency Section */}
      <section id="transparency" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-4">
          🔍 Trasparenza Totale
        </h2>
        <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
          Crediamo nella trasparenza. Ecco esattamente cosa fa questo software, come funziona e cosa NON fa.
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* What it is */}
          <Card className="bg-green-500/10 border-green-500/30">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6" />
                Cosa È
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-300">
              <p>✅ <strong>Software gestionale CRM</strong> per piccole/medie imprese italiane</p>
              <p>✅ <strong>Gratuito e open source</strong> - codice visibile su GitHub</p>
              <p>✅ <strong>PWA installabile</strong> - funziona come app nativa su PC, Mac, Android, iOS</p>
              <p>✅ <strong>Funziona offline</strong> - i dati vengono salvati localmente e sincronizzati</p>
              <p>✅ <strong>Dati in cloud</strong> - backup automatico su server Supabase (EU)</p>
              <p>✅ <strong>Autenticazione sicura</strong> - login con email/password criptata</p>
              <p>✅ <strong>Multi-utente</strong> - più operatori possono accedere contemporaneamente</p>
            </CardContent>
          </Card>

          {/* What it isn't */}
          <Card className="bg-red-500/10 border-red-500/30">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Cosa NON È
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-300">
              <p>❌ <strong>Non è un software di fatturazione</strong> - non emette fatture elettroniche</p>
              <p>❌ <strong>Non è collegato all'Agenzia delle Entrate</strong></p>
              <p>❌ <strong>Non gestisce pagamenti</strong> - nessuna integrazione con banche/POS</p>
              <p>❌ <strong>Non è certificato per normative specifiche</strong> (GDPR self-hosted)</p>
              <p>❌ <strong>Non offriamo supporto garantito</strong> - è un progetto community</p>
              <p>❌ <strong>Non raccogliamo dati</strong> - i tuoi dati restano tuoi</p>
              <p>❌ <strong>Non ci sono costi nascosti</strong> - zero, nada, niente</p>
            </CardContent>
          </Card>
        </div>

        {/* Tech Stack */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-white text-center mb-6">
            <Code className="inline h-5 w-5 mr-2" />
            Stack Tecnologico
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map((tech) => (
              <Badge key={tech.name} variant="outline" className="px-4 py-2 text-sm border-blue-500/50 text-blue-300">
                {tech.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Data & Privacy */}
        <Card className="mt-12 bg-blue-500/10 border-blue-500/30 max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-blue-400 flex items-center gap-2">
              <Lock className="h-6 w-6" />
              Privacy & Sicurezza
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-2">
            <p>🔒 <strong>I tuoi dati sono tuoi.</strong> Vengono salvati nel tuo database Supabase (server EU) o in locale sul tuo dispositivo.</p>
            <p>🔒 <strong>Nessun tracciamento.</strong> Non usiamo Google Analytics, cookies di profilazione o servizi di terze parti invasivi.</p>
            <p>🔒 <strong>Password criptate.</strong> Usiamo bcrypt con salt per le password, gestito da Supabase Auth.</p>
            <p>🔒 <strong>Row Level Security.</strong> Ogni utente vede solo i propri dati grazie a policy RLS su PostgreSQL.</p>
          </CardContent>
        </Card>
      </section>

      {/* Installation Guide */}
      <section id="guide" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-4">
          📖 Guida all'Installazione
        </h2>
        <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
          Tre modi per usare Aurem CRM: online, come app installata, o sul tuo server
        </p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Option 1: Online */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-green-600/20 flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-green-400" />
              </div>
              <CardTitle className="text-white">1. Usa Online (Più Semplice)</CardTitle>
              <Badge className="w-fit bg-green-600/20 text-green-400 border-green-500/30">Consigliato</Badge>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <div className="space-y-2">
                <p className="font-medium text-white">Passaggi:</p>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Clicca <strong>"Prova la Demo"</strong> qui sopra</li>
                  <li>Registra un nuovo account con la tua email</li>
                  <li>Conferma l'email cliccando sul link ricevuto</li>
                  <li>Accedi e inizia a usare il CRM!</li>
                </ol>
              </div>
              <Separator className="bg-white/10" />
              <div className="text-sm">
                <p className="text-green-400">✅ Nessuna installazione</p>
                <p className="text-green-400">✅ Backup automatico cloud</p>
                <p className="text-green-400">✅ Sempre aggiornato</p>
              </div>
            </CardContent>
          </Card>

          {/* Option 2: PWA Install */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-blue-600/20 flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-blue-400" />
              </div>
              <CardTitle className="text-white">2. Installa come App</CardTitle>
              <Badge className="w-fit bg-blue-600/20 text-blue-400 border-blue-500/30">PWA</Badge>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <div className="space-y-2">
                <p className="font-medium text-white">Su Desktop (Chrome/Edge):</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Apri il sito nel browser</li>
                  <li>Clicca l'icona <strong>⊕</strong> nella barra indirizzi</li>
                  <li>Clicca "Installa"</li>
                </ol>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-white">Su Mobile:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li><strong>iPhone:</strong> Safari → Condividi → "Aggiungi a Home"</li>
                  <li><strong>Android:</strong> Chrome → Menu ⋮ → "Installa app"</li>
                </ol>
              </div>
              <Separator className="bg-white/10" />
              <div className="text-sm">
                <p className="text-blue-400">✅ Funziona offline</p>
                <p className="text-blue-400">✅ Icona sulla home/desktop</p>
                <p className="text-blue-400">✅ Esperienza app nativa</p>
              </div>
            </CardContent>
          </Card>

          {/* Option 3: Self-hosted */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-purple-600/20 flex items-center justify-center mb-4">
                <Server className="h-6 w-6 text-purple-400" />
              </div>
              <CardTitle className="text-white">3. Self-Hosted (Avanzato)</CardTitle>
              <Badge className="w-fit bg-purple-600/20 text-purple-400 border-purple-500/30">Developer</Badge>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <div className="space-y-2">
                <p className="font-medium text-white">Requisiti:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Node.js 18+ installato</li>
                  <li>Account Supabase (gratuito)</li>
                  <li>Git installato</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-white">Comandi:</p>
                <div className="bg-black/40 rounded-lg p-3 text-xs font-mono overflow-x-auto">
                  <p className="text-green-400"># Clona il repository</p>
                  <p>git clone https://github.com/user/aurem-crm.git</p>
                  <p>cd aurem-crm</p>
                  <p className="text-green-400 mt-2"># Installa dipendenze</p>
                  <p>npm install</p>
                  <p className="text-green-400 mt-2"># Configura .env</p>
                  <p>cp .env.example .env</p>
                  <p className="text-green-400 mt-2"># Avvia in sviluppo</p>
                  <p>npm run dev</p>
                </div>
              </div>
              <Separator className="bg-white/10" />
              <div className="text-sm">
                <p className="text-purple-400">✅ Controllo totale</p>
                <p className="text-purple-400">✅ Personalizzabile</p>
                <p className="text-purple-400">✅ Tuo server/database</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Guide Link */}
        <div className="text-center mt-12">
          <Button size="lg" variant="outline" className="gap-2" asChild>
            <Link to="/guida">
              <BookOpen className="h-5 w-5" />
              Guida Completa Dettagliata
            </Link>
          </Button>
        </div>
      </section>

      {/* Donation Section */}
      <section id="donate" className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-rose-600/20 to-pink-600/20 border-rose-500/30 max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <Heart className="h-12 w-12 text-rose-400 mx-auto mb-4" />
            <CardTitle className="text-2xl text-white">Supporta il Progetto</CardTitle>
            <CardDescription className="text-slate-300 text-base">
              Aurem CRM è <strong>gratuito e open source</strong>. Se ti è utile e vuoi supportare lo sviluppo, 
              considera una piccola donazione. Non è obbligatoria, ma è molto apprezzata! ❤️
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="flex flex-wrap justify-center gap-3">
              <Button className="bg-[#0070ba] hover:bg-[#005ea6]" asChild>
                <a href="https://paypal.me/tuopaypal" target="_blank" rel="noopener noreferrer">
                  PayPal
                </a>
              </Button>
              <Button className="bg-[#FF5E5B] hover:bg-[#e54d4a]" asChild>
                <a href="https://ko-fi.com/tuokofii" target="_blank" rel="noopener noreferrer">
                  <Coffee className="h-4 w-4 mr-2" />
                  Ko-fi
                </a>
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
                <a href="https://github.com/tuouser/aurem" target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4 mr-2" />
                  Star su GitHub
                </a>
              </Button>
            </div>
            <p className="text-sm text-slate-400 text-center">
              Anche solo una ⭐ su GitHub ci aiuta a crescere!
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img src={auremLogo} alt="Aurem" className="h-8 w-auto" />
              <span className="text-slate-400 text-sm">© 2024 Aurem CRM</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/guida" className="text-slate-400 hover:text-white transition-colors">Guida</Link>
              <Link to="/auth" className="text-slate-400 hover:text-white transition-colors">Accedi</Link>
              <a href="https://github.com/tuouser/aurem" className="text-slate-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">GitHub</a>
            </div>
          </div>
          <p className="text-center text-slate-500 text-xs mt-4">
            Fatto con ❤️ in Italia • Open Source sotto licenza MIT
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
