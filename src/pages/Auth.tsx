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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailUp, setEmailUp] = useState("");
  const [passwordUp, setPasswordUp] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) navigate("/", { replace: true });
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/", { replace: true });
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Security: Validate input before sending to Supabase
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const errors = validation.error.errors.map(err => err.message).join(", ");
      toast({ title: "Errore di validazione", description: errors, variant: "destructive" });
      return;
    }
    
    const { error } = await supabase.auth.signInWithPassword({ 
      email: validation.data.email, 
      password: validation.data.password 
    });
    
    if (error) {
      toast({ title: "Accesso fallito", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Benvenuto", description: "Login effettuato con successo" });
      navigate("/", { replace: true });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Security: Validate input before sending to Supabase
    const validation = signupSchema.safeParse({ email: emailUp, password: passwordUp });
    if (!validation.success) {
      const errors = validation.error.errors.map(err => err.message).join(", ");
      toast({ title: "Errore di validazione", description: errors, variant: "destructive" });
      return;
    }
    
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email: validation.data.email,
      password: validation.data.password,
      options: { emailRedirectTo: redirectUrl },
    });
    
    if (error) {
      toast({ title: "Registrazione fallita", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Controlla la tua email", description: "Conferma l'indirizzo per completare l'accesso" });
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-muted-foreground">Caricamento…</div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Accedi al Gestionale</CardTitle>
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
                <Button type="submit" className="w-full">Entra</Button>
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
                <Button type="submit" className="w-full">Crea account</Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
