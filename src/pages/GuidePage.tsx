import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  ArrowLeft,
  Globe,
  Smartphone,
  Server,
  Download,
  Settings,
  Database,
  Shield,
  CheckCircle2,
  Terminal,
  FileCode,
  Key,
  Users,
  Package,
  FileText,
  Receipt,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import auremLogo from "@/assets/aurem-logo.png";

const GuidePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-50 bg-slate-900/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <img src={auremLogo} alt="Aurem" className="h-8 w-auto" />
            <span className="text-white font-semibold">Guida Completa</span>
          </div>
          <Button asChild>
            <Link to="/auth">Accedi alla Demo</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Intro */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            📖 Guida Completa ad Aurem CRM
          </h1>
          <p className="text-xl text-slate-300">
            Tutto quello che devi sapere per installare, configurare e usare il gestionale
          </p>
        </div>

        {/* Table of Contents */}
        <Card className="bg-white/5 border-white/10 mb-12">
          <CardHeader>
            <CardTitle className="text-white">📋 Indice</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-2 text-slate-300">
            <a href="#cos-e" className="hover:text-blue-400 transition-colors">1. Cos'è Aurem CRM</a>
            <a href="#funzionalita" className="hover:text-blue-400 transition-colors">2. Funzionalità</a>
            <a href="#uso-online" className="hover:text-blue-400 transition-colors">3. Uso Online</a>
            <a href="#installazione-pwa" className="hover:text-blue-400 transition-colors">4. Installazione PWA</a>
            <a href="#self-hosted" className="hover:text-blue-400 transition-colors">5. Self-Hosted</a>
            <a href="#configurazione" className="hover:text-blue-400 transition-colors">6. Configurazione</a>
            <a href="#primo-accesso" className="hover:text-blue-400 transition-colors">7. Primo Accesso</a>
            <a href="#faq" className="hover:text-blue-400 transition-colors">8. FAQ</a>
          </CardContent>
        </Card>

        {/* Section 1: What is it */}
        <section id="cos-e" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-sm">1</span>
            Cos'è Aurem CRM
          </h2>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6 text-slate-300 space-y-4">
              <p>
                <strong className="text-white">Aurem CRM</strong> è un sistema gestionale completo progettato per piccole e medie imprese italiane. 
                È completamente <strong className="text-green-400">gratuito</strong> e <strong className="text-green-400">open source</strong>.
              </p>
              <p>
                Puoi usarlo online, installarlo come app sul tuo dispositivo (PC, Mac, smartphone, tablet), 
                oppure installarlo sul tuo server per avere il controllo totale.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 pt-4">
                <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <Globe className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="font-medium text-white">Web App</p>
                  <p className="text-sm">Usa dal browser</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <Smartphone className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <p className="font-medium text-white">PWA</p>
                  <p className="text-sm">Installa come app</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <Server className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <p className="font-medium text-white">Self-Hosted</p>
                  <p className="text-sm">Sul tuo server</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 2: Features */}
        <section id="funzionalita" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-sm">2</span>
            Funzionalità
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-2">
                <Users className="h-6 w-6 text-blue-400" />
                <CardTitle className="text-white text-lg">Gestione Clienti</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 text-sm">
                <ul className="space-y-1">
                  <li>• Anagrafica persone fisiche e aziende</li>
                  <li>• Dati fiscali italiani (P.IVA, CF, SDI)</li>
                  <li>• Storico contatti e note</li>
                  <li>• Filtri e ricerca avanzata</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-2">
                <Package className="h-6 w-6 text-green-400" />
                <CardTitle className="text-white text-lg">Magazzino</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 text-sm">
                <ul className="space-y-1">
                  <li>• Prodotti con categorie</li>
                  <li>• Numeri seriali e lotti</li>
                  <li>• Movimenti carico/scarico</li>
                  <li>• Avvisi scorta minima</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-2">
                <FileText className="h-6 w-6 text-amber-400" />
                <CardTitle className="text-white text-lg">Contratti</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 text-sm">
                <ul className="space-y-1">
                  <li>• Contratti clienti (esterni)</li>
                  <li>• Contratti dipendenti (interni)</li>
                  <li>• Scadenze e rinnovi automatici</li>
                  <li>• Upload documenti PDF</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-2">
                <Receipt className="h-6 w-6 text-cyan-400" />
                <CardTitle className="text-white text-lg">Preventivi</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 text-sm">
                <ul className="space-y-1">
                  <li>• Creazione preventivi professionali</li>
                  <li>• Righe prodotto con sconti</li>
                  <li>• Calcolo IVA automatico</li>
                  <li>• Stati: bozza, inviato, accettato</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 3: Online Use */}
        <section id="uso-online" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-sm">3</span>
            Uso Online (Più Semplice)
          </h2>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6 text-slate-300 space-y-4">
              <Badge className="bg-green-600/20 text-green-400 border-green-500/30">Consigliato per iniziare</Badge>
              
              <div className="space-y-4 mt-4">
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">1</div>
                  <div>
                    <p className="font-medium text-white">Vai alla pagina di login</p>
                    <p className="text-sm">Clicca su "Prova la Demo" o "Accedi" dalla homepage</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">2</div>
                  <div>
                    <p className="font-medium text-white">Registra un account</p>
                    <p className="text-sm">Inserisci email e password (min. 12 caratteri con maiuscole, minuscole e numeri)</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">3</div>
                  <div>
                    <p className="font-medium text-white">Conferma l'email</p>
                    <p className="text-sm">Riceverai un'email di conferma, clicca sul link per attivare l'account</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0">4</div>
                  <div>
                    <p className="font-medium text-white">Inizia a usare il CRM!</p>
                    <p className="text-sm">Accedi con le tue credenziali e inizia a gestire clienti, prodotti e documenti</p>
                  </div>
                </div>
              </div>

              <Card className="bg-amber-500/10 border-amber-500/30 mt-6">
                <CardContent className="pt-4">
                  <p className="text-amber-300 text-sm">
                    <strong>🔐 Per provare subito:</strong><br />
                    Email: <code className="bg-black/30 px-2 py-0.5 rounded">demo@aurem.it</code><br />
                    Password: <code className="bg-black/30 px-2 py-0.5 rounded">Demo1234!@#$</code>
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </section>

        {/* Section 4: PWA Installation */}
        <section id="installazione-pwa" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-sm">4</span>
            Installazione come App (PWA)
          </h2>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6 text-slate-300 space-y-6">
              <p>
                Puoi installare Aurem CRM come un'app nativa sul tuo dispositivo. 
                Funzionerà anche <strong className="text-white">offline</strong> e avrà un'icona sulla home/desktop.
              </p>

              {/* Desktop */}
              <div>
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Settings className="h-5 w-5" /> Desktop (Windows/Mac/Linux)
                </h3>
                <div className="bg-black/30 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="font-medium text-blue-400">Chrome / Edge:</p>
                    <ol className="list-decimal list-inside text-sm mt-1">
                      <li>Apri <code className="bg-black/50 px-1 rounded">aurem.lovable.app</code></li>
                      <li>Cerca l'icona <strong>⊕</strong> o <strong>↓</strong> nella barra degli indirizzi</li>
                      <li>Clicca "Installa Aurem CRM"</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Mobile */}
              <div>
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Smartphone className="h-5 w-5" /> Mobile (iPhone/Android)
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-black/30 rounded-lg p-4">
                    <p className="font-medium text-blue-400 mb-2">📱 iPhone (Safari):</p>
                    <ol className="list-decimal list-inside text-sm space-y-1">
                      <li>Apri il sito in Safari</li>
                      <li>Tocca il pulsante <strong>Condividi</strong> (quadrato con freccia)</li>
                      <li>Scorri e tocca <strong>"Aggiungi a Home"</strong></li>
                      <li>Tocca <strong>"Aggiungi"</strong></li>
                    </ol>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4">
                    <p className="font-medium text-green-400 mb-2">🤖 Android (Chrome):</p>
                    <ol className="list-decimal list-inside text-sm space-y-1">
                      <li>Apri il sito in Chrome</li>
                      <li>Tocca il menu <strong>⋮</strong> (tre puntini)</li>
                      <li>Tocca <strong>"Installa app"</strong> o <strong>"Aggiungi a Home"</strong></li>
                      <li>Conferma l'installazione</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-400">Vantaggi dell'installazione:</p>
                  <ul className="mt-1 space-y-1">
                    <li>• Avvio rapido dalla home/desktop</li>
                    <li>• Funziona anche senza internet</li>
                    <li>• Esperienza a schermo intero</li>
                    <li>• Sincronizzazione automatica quando torni online</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 5: Self-Hosted */}
        <section id="self-hosted" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-sm">5</span>
            Self-Hosted (Per Sviluppatori)
          </h2>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6 text-slate-300 space-y-6">
              <Badge className="bg-purple-600/20 text-purple-400 border-purple-500/30">Richiede competenze tecniche</Badge>

              {/* Requirements */}
              <div>
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Terminal className="h-5 w-5" /> Requisiti
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span><strong>Node.js 18+</strong> - <a href="https://nodejs.org" className="text-blue-400 hover:underline" target="_blank">nodejs.org</a></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span><strong>Git</strong> - <a href="https://git-scm.com" className="text-blue-400 hover:underline" target="_blank">git-scm.com</a></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span><strong>Account Supabase</strong> (gratuito) - <a href="https://supabase.com" className="text-blue-400 hover:underline" target="_blank">supabase.com</a></span>
                  </li>
                </ul>
              </div>

              {/* Installation Steps */}
              <div>
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <FileCode className="h-5 w-5" /> Passi di Installazione
                </h3>
                <div className="bg-black/40 rounded-lg p-4 font-mono text-sm overflow-x-auto space-y-4">
                  <div>
                    <p className="text-green-400"># 1. Clona il repository</p>
                    <p className="text-white">git clone https://github.com/tuouser/aurem-crm.git</p>
                    <p className="text-white">cd aurem-crm</p>
                  </div>
                  <div>
                    <p className="text-green-400"># 2. Installa le dipendenze</p>
                    <p className="text-white">npm install</p>
                  </div>
                  <div>
                    <p className="text-green-400"># 3. Copia il file di configurazione</p>
                    <p className="text-white">cp .env.example .env</p>
                  </div>
                  <div>
                    <p className="text-green-400"># 4. Modifica .env con le tue credenziali Supabase</p>
                    <p className="text-slate-400"># VITE_SUPABASE_URL=https://tuoprogetto.supabase.co</p>
                    <p className="text-slate-400"># VITE_SUPABASE_ANON_KEY=eyJ...</p>
                  </div>
                  <div>
                    <p className="text-green-400"># 5. Avvia in modalità sviluppo</p>
                    <p className="text-white">npm run dev</p>
                  </div>
                  <div>
                    <p className="text-green-400"># 6. Per creare la build di produzione</p>
                    <p className="text-white">npm run build</p>
                  </div>
                </div>
              </div>

              {/* Supabase Setup */}
              <div>
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Database className="h-5 w-5" /> Configurazione Supabase
                </h3>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Crea un nuovo progetto su <a href="https://supabase.com" className="text-blue-400 hover:underline" target="_blank">supabase.com</a></li>
                  <li>Vai su <strong>Settings → API</strong> e copia:
                    <ul className="list-disc list-inside ml-6 mt-1 text-sm">
                      <li>Project URL (es: https://abc123.supabase.co)</li>
                      <li>anon/public key</li>
                    </ul>
                  </li>
                  <li>Vai su <strong>SQL Editor</strong> e esegui le migrazioni dalla cartella <code>supabase/migrations/</code></li>
                  <li>Configura l'autenticazione su <strong>Authentication → Providers</strong></li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 6: Configuration */}
        <section id="configurazione" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-sm">6</span>
            Configurazione
          </h2>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6 text-slate-300">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="env">
                  <AccordionTrigger className="text-white">
                    <span className="flex items-center gap-2">
                      <Key className="h-4 w-4" /> Variabili d'ambiente (.env)
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-300">
                    <div className="bg-black/40 rounded-lg p-4 font-mono text-sm">
                      <p className="text-slate-400"># Supabase</p>
                      <p>VITE_SUPABASE_URL=https://tuoprogetto.supabase.co</p>
                      <p>VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="auth">
                  <AccordionTrigger className="text-white">
                    <span className="flex items-center gap-2">
                      <Shield className="h-4 w-4" /> Autenticazione
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-300">
                    <p>L'autenticazione è gestita da Supabase Auth. Supporta:</p>
                    <ul className="list-disc list-inside mt-2">
                      <li>Email + Password</li>
                      <li>Magic Link (link via email)</li>
                      <li>OAuth (Google, GitHub, etc.) - configurabile</li>
                    </ul>
                    <p className="mt-2">Le password richiedono minimo 12 caratteri con maiuscole, minuscole e numeri.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </section>

        {/* Section 7: First Access */}
        <section id="primo-accesso" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-sm">7</span>
            Primo Accesso e Uso
          </h2>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6 text-slate-300 space-y-4">
              <p>Dopo aver effettuato l'accesso, troverai:</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-black/30 rounded-lg">
                  <p className="font-medium text-white mb-2">📊 Dashboard</p>
                  <p className="text-sm">Panoramica con statistiche, attività recenti e scadenze imminenti</p>
                </div>
                <div className="p-4 bg-black/30 rounded-lg">
                  <p className="font-medium text-white mb-2">👥 Clienti</p>
                  <p className="text-sm">Gestisci l'anagrafica di persone fisiche e aziende</p>
                </div>
                <div className="p-4 bg-black/30 rounded-lg">
                  <p className="font-medium text-white mb-2">📦 Magazzino</p>
                  <p className="text-sm">Prodotti, categorie, seriali e movimenti di stock</p>
                </div>
                <div className="p-4 bg-black/30 rounded-lg">
                  <p className="font-medium text-white mb-2">📄 Contratti</p>
                  <p className="text-sm">Crea e gestisci contratti con scadenze automatiche</p>
                </div>
                <div className="p-4 bg-black/30 rounded-lg">
                  <p className="font-medium text-white mb-2">🧾 Preventivi</p>
                  <p className="text-sm">Genera preventivi professionali per i clienti</p>
                </div>
                <div className="p-4 bg-black/30 rounded-lg">
                  <p className="font-medium text-white mb-2">⚙️ Impostazioni</p>
                  <p className="text-sm">Personalizza il tuo profilo e le preferenze</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 8: FAQ */}
        <section id="faq" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-sm">8</span>
            Domande Frequenti (FAQ)
          </h2>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="faq-1">
                  <AccordionTrigger className="text-white text-left">
                    È davvero gratuito?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-300">
                    Sì, al 100%. Il software è open source e gratuito. L'unico costo potenziale è se superi i limiti del piano gratuito di Supabase (che sono molto generosi per piccole aziende).
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-2">
                  <AccordionTrigger className="text-white text-left">
                    Posso usarlo per la mia azienda?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-300">
                    Assolutamente sì. È pensato proprio per piccole e medie imprese italiane. Tuttavia, non emette fatture elettroniche - per quello ti serve un software di fatturazione separato.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-3">
                  <AccordionTrigger className="text-white text-left">
                    I miei dati sono al sicuro?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-300">
                    I dati sono salvati su Supabase (server EU). Ogni utente vede solo i propri dati grazie a Row Level Security. Le password sono criptate con bcrypt. Se vuoi il massimo controllo, puoi fare self-hosting.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-4">
                  <AccordionTrigger className="text-white text-left">
                    Funziona offline?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-300">
                    Sì, se installi l'app (PWA). I dati vengono salvati localmente e sincronizzati quando torni online. Alcune funzionalità che richiedono il server non saranno disponibili offline.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-5">
                  <AccordionTrigger className="text-white text-left">
                    Posso personalizzarlo?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-300">
                    Certo! Essendo open source, puoi scaricare il codice e modificarlo come vuoi. È fatto con React, TypeScript e Tailwind CSS.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-6">
                  <AccordionTrigger className="text-white text-left">
                    Come posso contribuire?
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-300">
                    Puoi: segnalare bug, proporre feature, contribuire al codice su GitHub, fare una donazione, o semplicemente spargere la voce!
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <div className="text-center pt-8">
          <h3 className="text-2xl font-bold text-white mb-4">Pronto per iniziare?</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="gap-2 bg-green-600 hover:bg-green-700" asChild>
              <Link to="/auth">
                Prova la Demo
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2" asChild>
              <Link to="/">
                Torna alla Home
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-slate-400">
          <p>© 2024 Aurem CRM • Open Source • MIT License</p>
        </div>
      </footer>
    </div>
  );
};

export default GuidePage;
