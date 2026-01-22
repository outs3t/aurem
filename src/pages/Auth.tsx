import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Security: Input validation schemas
const emailSchema = z.string()
  .trim()
  .email({ message: "Indirizzo email non valido" })
  .max(255, { message: "L'email deve essere inferiore a 255 caratteri" });

const passwordSchema = z.string()
  .min(12, { message: "La password deve contenere almeno 12 caratteri" })
  .max(128, { message: "La password deve essere inferiore a 128 caratteri" })
  .regex(/[a-z]/, { message: "La password deve contenere almeno una lettera minuscola" })
  .regex(/[A-Z]/, { message: "La password deve contenere almeno una lettera maiuscola" })
  .regex(/[0-9]/, { message: "La password deve contenere almeno un numero" });

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "La password è obbligatoria" }),
});

const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submittingLogin, setSubmittingLogin] = useState(false);
  const [submittingSignup, setSubmittingSignup] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailUp, setEmailUp] = useState("");
  const [passwordUp, setPasswordUp] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) navigate("/dashboard", { replace: true });
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard", { replace: true });
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    
    // Security: Validate input before sending to Supabase
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const errors = validation.error.errors.map(err => err.message).join(", ");
      toast({ title: "Errore di validazione", description: errors, variant: "destructive" });
      return;
    }

    try {
      setSubmittingLogin(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: validation.data.email,
        password: validation.data.password,
      });

      if (error) {
        const msg = /invalid login credentials/i.test(error.message)
          ? "Credenziali non valide oppure utente inesistente."
          : error.message;
        setLoginError(msg);
        toast({ title: "Accesso fallito", description: msg, variant: "destructive" });
        return;
      }

      toast({ title: "Benvenuto", description: "Login effettuato con successo" });
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      const msg = err?.message || "Errore imprevisto durante l'accesso";
      setLoginError(msg);
      toast({ title: "Accesso fallito", description: msg, variant: "destructive" });
    } finally {
      setSubmittingLogin(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);
    
    // Security: Validate input before sending to Supabase
    const validation = signupSchema.safeParse({ email: emailUp, password: passwordUp });
    if (!validation.success) {
      const errors = validation.error.errors.map(err => err.message).join(", ");
      toast({ title: "Errore di validazione", description: errors, variant: "destructive" });
      return;
    }

    try {
      setSubmittingSignup(true);
      const redirectUrl = `${window.location.origin}/dashboard`;
      const { error } = await supabase.auth.signUp({
        email: validation.data.email,
        password: validation.data.password,
        options: { emailRedirectTo: redirectUrl },
      });

      if (error) {
        setSignupError(error.message);
        toast({ title: "Registrazione fallita", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Controlla la tua email", description: "Conferma l'indirizzo per completare l'accesso" });
      }
    } catch (err: any) {
      const msg = err?.message || "Errore imprevisto durante la registrazione";
      setSignupError(msg);
      toast({ title: "Registrazione fallita", description: msg, variant: "destructive" });
    } finally {
      setSubmittingSignup(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-muted-foreground">Caricamento…</div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-center text-white">Accedi al Gestionale</CardTitle>
          <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <p className="text-amber-300 text-sm text-center">
              <strong>🔐 Credenziali Demo:</strong><br />
              Email: <code className="bg-black/30 px-1 rounded">demo@aurem.it</code><br />
              Password: <code className="bg-black/30 px-1 rounded">Demo1234!@#$</code>
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Registrati</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form className="space-y-4 mt-4" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={submittingLogin} aria-busy={submittingLogin}>
                  {submittingLogin ? "Accesso in corso…" : "Entra"}
                </Button>
                {loginError && (
                  <p className="text-sm text-destructive" role="alert">
                    {loginError}
                  </p>
                )}
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form className="space-y-4 mt-4" onSubmit={handleSignup}>
                <div className="space-y-2">
                  <Label htmlFor="emailUp">Email</Label>
                  <Input id="emailUp" type="email" value={emailUp} onChange={(e) => setEmailUp(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordUp">Password</Label>
                  <Input id="passwordUp" type="password" value={passwordUp} onChange={(e) => setPasswordUp(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={submittingSignup} aria-busy={submittingSignup}>
                  {submittingSignup ? "Creazione in corso…" : "Crea account"}
                </Button>
                {signupError && (
                  <p className="text-sm text-destructive" role="alert">
                    {signupError}
                  </p>
                )}
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
