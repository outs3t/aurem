import { useState } from "react";
import { Building2, Mail, ArrowRight, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePendingInvites, useAcceptInvite, useCreateWorkspace } from "@/hooks/useWorkspace";
import { toast } from "sonner";

interface WorkspaceOnboardingProps {
  onComplete: () => void;
}

export function WorkspaceOnboarding({ onComplete }: WorkspaceOnboardingProps) {
  const { data: pendingInvites, isLoading: loadingInvites } = usePendingInvites();
  const acceptInvite = useAcceptInvite();
  const createWorkspace = useCreateWorkspace();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const hasInvites = pendingInvites && pendingInvites.length > 0;

  const handleAcceptInvite = async (inviteId: string) => {
    await acceptInvite.mutateAsync(inviteId);
    onComplete();
  };

  const handleDeclineInvite = async (inviteId: string) => {
    // Per ora solo toast, poi implementare decline
    toast.info("Invito rifiutato");
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      toast.error("Inserisci il nome dell'azienda");
      return;
    }

    setIsCreating(true);
    try {
      const slug = companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      await createWorkspace.mutateAsync({ name: companyName, slug });
      onComplete();
    } finally {
      setIsCreating(false);
    }
  };

  if (loadingInvites) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <Building2 className="h-12 w-12 mx-auto text-primary" />
          <h1 className="text-2xl font-bold">Benvenuto in Aurem</h1>
          <p className="text-muted-foreground">
            Configura il tuo spazio di lavoro aziendale
          </p>
        </div>

        {/* Inviti pendenti */}
        {hasInvites && !showCreateForm && (
          <div className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              Hai {pendingInvites.length} invito/i in attesa
            </p>
            
            {pendingInvites.map((invite) => (
              <Card key={invite.id} className="border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    {invite.workspaces?.name || 'Azienda'}
                  </CardTitle>
                  <CardDescription>
                    Sei stato invitato a unirti a questo workspace
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    onClick={() => handleAcceptInvite(invite.id)}
                    disabled={acceptInvite.isPending}
                  >
                    {acceptInvite.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Accetta
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleDeclineInvite(invite.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  oppure
                </span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setShowCreateForm(true)}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Crea una nuova azienda
            </Button>
          </div>
        )}

        {/* Form creazione workspace */}
        {(!hasInvites || showCreateForm) && (
          <Card>
            <CardHeader>
              <CardTitle>Crea la tua azienda</CardTitle>
              <CardDescription>
                Crea un nuovo spazio di lavoro per la tua azienda. 
                Potrai invitare collaboratori e gestire i loro permessi.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateWorkspace} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nome Azienda</Label>
                  <Input
                    id="companyName"
                    placeholder="Es: Mario Rossi Srl"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    autoFocus
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isCreating || !companyName.trim()}
                >
                  {isCreating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  Crea e inizia
                </Button>

                {hasInvites && (
                  <Button 
                    type="button"
                    variant="ghost" 
                    className="w-full" 
                    onClick={() => setShowCreateForm(false)}
                  >
                    Torna agli inviti
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
