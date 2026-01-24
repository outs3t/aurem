import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
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
  Download,
  Play,
  Github,
  Coffee,
  Lock,
  Zap,
  Sparkles,
  ChevronDown,
  Eye,
  LogIn
} from "lucide-react";
import auremLogo from "@/assets/aurem-logo.png";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Animated Section Component
const AnimatedSection = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Feature Card with hover effects
const FeatureCard = ({ icon: Icon, title, description, index }: { icon: any; title: string; description: string; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 h-full hover:border-primary/30 transition-all duration-300">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

// Floating orbs background
const FloatingOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
    <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-info/10 rounded-full blur-3xl animate-float-slow" />
    <div className="absolute top-1/2 left-3/4 w-64 h-64 bg-success/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "-2s" }} />
  </div>
);

const LandingPage = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

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

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('mousemove', handleMouseMove);
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
    { icon: Users, title: "Gestione Clienti", description: "Anagrafica completa per persone fisiche e aziende con tutti i dati fiscali italiani" },
    { icon: Package, title: "Magazzino", description: "Gestione prodotti con numeri seriali, movimenti e scorte minime" },
    { icon: FileText, title: "Contratti", description: "Contratti interni ed esterni con scadenze e rinnovi automatici" },
    { icon: Receipt, title: "Preventivi", description: "Creazione preventivi professionali con generazione PDF" },
    { icon: MessageSquare, title: "Chat Team", description: "Sistema di messaggistica interna in tempo reale" },
    { icon: BarChart3, title: "Analytics", description: "Dashboard con metriche e statistiche aziendali" },
  ];

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Cursor follower gradient */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(var(--primary) / 0.06), transparent 40%)`,
        }}
      />

      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-xl bg-background/80"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <img src={auremLogo} alt="Aurem" className="h-9 w-auto" />
          </motion.div>

          <nav className="hidden md:flex items-center gap-8">
            {["Funzionalità", "Trasparenza", "Guida", "Supporta"].map((item, i) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="relative text-sm text-muted-foreground hover:text-foreground transition-colors group"
                whileHover={{ y: -2 }}
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
              </motion.a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Badge 
              variant={isOnline ? "default" : "destructive"} 
              className="gap-1.5 px-3 py-1"
            >
              {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {isOnline ? "Online" : "Offline"}
            </Badge>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link to="/auth" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Accedi
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section 
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center justify-center pt-20"
      >
        <FloatingOrbs />
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Badge variant="outline" className="mb-8 px-4 py-2 text-sm border-primary/30 bg-primary/5">
                <Sparkles className="w-4 h-4 mr-2 text-primary" />
                Open Source • Gratuito • PWA
              </Badge>
            </motion.div>

            {/* Title */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
            >
              <span className="text-foreground">Il CRM che </span>
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-info to-primary bg-[length:200%_auto] animate-gradient-x">
                  semplifica
                </span>
              </span>
              <br />
              <span className="text-foreground">il tuo business</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Gestionale italiano per clienti, magazzino, contratti e preventivi.
              <br className="hidden sm:block" />
              <span className="text-foreground font-medium">100% gratuito. 100% tuo.</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              {/* Demo Button */}
              <motion.div 
                whileHover={{ scale: 1.03 }} 
                whileTap={{ scale: 0.98 }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-info rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                <Button 
                  size="lg" 
                  className="relative gap-2 text-base px-8 py-6 bg-primary hover:bg-primary/90 rounded-xl shadow-lg"
                  asChild
                >
                  <Link to="/auth?mode=demo">
                    <Eye className="w-5 h-5" />
                    Prova la Demo
                  </Link>
                </Button>
              </motion.div>

              {/* Login Button */}
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="gap-2 text-base px-8 py-6 rounded-xl border-2"
                  asChild
                >
                  <Link to="/auth">
                    <LogIn className="w-5 h-5" />
                    Accedi al CRM
                  </Link>
                </Button>
              </motion.div>

              {/* Install Button */}
              {isInstallable && !isInstalled && (
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    size="lg" 
                    variant="ghost" 
                    className="gap-2 text-base"
                    onClick={handleInstall}
                  >
                    <Download className="w-5 h-5" />
                    Installa App
                  </Button>
                </motion.div>
              )}
            </motion.div>

            {/* Demo Credentials */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-warning/10 border border-warning/20 text-sm"
            >
              <Lock className="w-4 h-4 text-warning" />
              <span className="text-muted-foreground">
                Demo: <code className="text-foreground font-mono bg-background/50 px-2 py-0.5 rounded">demo@aurem.it</code>
                <span className="mx-2 text-border">|</span>
                <code className="text-foreground font-mono bg-background/50 px-2 py-0.5 rounded">Demo1234!@#$</code>
              </span>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.button
            onClick={scrollToFeatures}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown className="w-8 h-8" />
            </motion.div>
          </motion.button>
        </div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-3 py-1">
              <Zap className="w-3 h-3 mr-1" />
              Funzionalità
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Tutto quello che ti serve
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Strumenti potenti per gestire ogni aspetto della tua attività, senza costi nascosti
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Transparency Section */}
      <section id="trasparenza" className="py-24 relative bg-muted/30">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-3 py-1">
              <Shield className="w-3 h-3 mr-1" />
              Trasparenza
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Nessun segreto
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Crediamo nella trasparenza totale. Ecco cosa fa e cosa NON fa questo software.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* What it is */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-success/5 border border-success/20 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Cosa È</h3>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                {[
                  "Software gestionale CRM italiano",
                  "Gratuito e open source",
                  "PWA installabile su tutti i dispositivi",
                  "Funziona anche offline",
                  "Dati in cloud EU (Supabase)",
                  "Autenticazione sicura",
                  "Multi-utente e multi-workspace",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* What it isn't */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-destructive/5 border border-destructive/20 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Cosa NON È</h3>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                {[
                  "Non è un software di fatturazione elettronica",
                  "Non è collegato all'Agenzia delle Entrate",
                  "Non gestisce pagamenti o POS",
                  "Non è certificato GDPR (self-hosted)",
                  "Non offriamo supporto garantito",
                  "Non raccogliamo i tuoi dati",
                  "Non ci sono costi nascosti",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-destructive font-bold mt-0.5">✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Privacy Card */}
          <AnimatedSection delay={0.3} className="mt-12 max-w-3xl mx-auto">
            <div className="bg-info/5 border border-info/20 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-6 h-6 text-info" />
                <h3 className="text-xl font-semibold text-foreground">Privacy & Sicurezza</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 text-muted-foreground text-sm">
                <p>🔒 I tuoi dati restano tuoi, sempre</p>
                <p>🔒 Nessun tracciamento o analytics invasivi</p>
                <p>🔒 Password criptate con bcrypt</p>
                <p>🔒 Row Level Security su PostgreSQL</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Guide Section */}
      <section id="guida" className="py-24 relative">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Inizia in 30 secondi
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Tre semplici passaggi per iniziare a usare Aurem
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "01", title: "Registrati", desc: "Crea un account con la tua email in pochi secondi" },
              { step: "02", title: "Crea Workspace", desc: "Configura la tua azienda e invita il team" },
              { step: "03", title: "Inizia a lavorare", desc: "Aggiungi clienti, prodotti e gestisci tutto" },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="text-center"
              >
                <div className="text-6xl font-bold text-primary/20 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <AnimatedSection delay={0.4} className="text-center mt-12">
            <Button size="lg" variant="outline" asChild className="gap-2">
              <Link to="/guida">
                Guida Completa
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* Donation Section */}
      <section id="supporta" className="py-24 relative bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block mb-6"
            >
              <Heart className="w-16 h-16 text-destructive" />
            </motion.div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Supporta il Progetto
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Aurem è gratuito e open source. Se ti è utile, considera una piccola donazione. 
              Non è obbligatoria, ma è molto apprezzata! ❤️
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-[#0070ba] hover:bg-[#005ea6] gap-2" asChild>
                  <a href="https://paypal.me/tuopaypal" target="_blank" rel="noopener noreferrer">
                    PayPal
                  </a>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-[#FF5E5B] hover:bg-[#e54d4a] gap-2" asChild>
                  <a href="https://ko-fi.com/tuokofii" target="_blank" rel="noopener noreferrer">
                    <Coffee className="w-4 h-4" />
                    Ko-fi
                  </a>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" className="gap-2" asChild>
                  <a href="https://github.com/tuouser/aurem" target="_blank" rel="noopener noreferrer">
                    <Github className="w-4 h-4" />
                    Star su GitHub
                  </a>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img src={auremLogo} alt="Aurem" className="h-8 w-auto" />
              <span className="text-muted-foreground text-sm">© 2024 Aurem CRM</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <Link to="/guida" className="text-muted-foreground hover:text-foreground transition-colors">
                Guida
              </Link>
              <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
                Accedi
              </Link>
              <a 
                href="https://github.com/tuouser/aurem" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                target="_blank" 
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </div>
          </div>
          
          <p className="text-center text-muted-foreground text-xs mt-8">
            Fatto con ❤️ in Italia • Open Source sotto licenza MIT
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
