import { Users, Package, FileText, Calculator, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const recentActivities = [
  {
    id: 1,
    type: "contract",
    title: "Contratto scade tra 5 giorni",
    client: "Mario Rossi",
    time: "2 ore fa",
    priority: "high",
  },
  {
    id: 2,
    type: "client",
    title: "Nuovo cliente aggiunto",
    client: "TechnoSoft S.r.l.",
    time: "4 ore fa",
    priority: "medium",
  },
  {
    id: 3,
    type: "inventory",
    title: "Prodotto in esaurimento",
    client: "Laptop Dell XPS",
    time: "6 ore fa",
    priority: "high",
  },
  {
    id: 4,
    type: "quote",
    title: "Preventivo generato",
    client: "Green Energy S.p.A.",
    time: "1 giorno fa",
    priority: "low",
  },
];

const upcomingContracts = [
  { id: 1, client: "Mario Rossi", expires: "15/01/2025", value: "€15.000" },
  { id: 2, client: "Beta Solutions", expires: "22/01/2025", value: "€8.500" },
  { id: 3, client: "Gamma Industries", expires: "28/01/2025", value: "€22.000" },
];

export default function Dashboard() {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive";
      case "medium":
        return "bg-warning";
      case "low":
        return "bg-success";
      default:
        return "bg-muted";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Alta";
      case "medium":
        return "Media";
      case "low":
        return "Bassa";
      default:
        return "N/D";
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Panoramica generale del tuo sistema CRM
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Clienti Totali"
          value="1,247"
          change="+12% dal mese scorso"
          changeType="positive"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Prodotti in Magazzino"
          value="847"
          change="-3% dal mese scorso"
          changeType="negative"
          icon={<Package className="h-4 w-4" />}
        />
        <StatCard
          title="Contratti Attivi"
          value="89"
          change="+5% dal mese scorso"
          changeType="positive"
          icon={<FileText className="h-4 w-4" />}
        />
        <StatCard
          title="Fatturato Mensile"
          value="€125,420"
          change="+18% dal mese scorso"
          changeType="positive"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activities */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Attività Recenti</CardTitle>
            <CardDescription>
              Ultimi aggiornamenti e notifiche del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activity.client} • {activity.time}
                  </p>
                </div>
                <Badge className={getPriorityColor(activity.priority)}>
                  {getPriorityLabel(activity.priority)}
                </Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4">
              Vedi tutte le attività
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Contract Expirations */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Contratti in Scadenza</CardTitle>
            <CardDescription>
              Contratti che scadranno nei prossimi 30 giorni
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingContracts.map((contract) => (
              <div key={contract.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {contract.client}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Scade il {contract.expires}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{contract.value}</p>
                  <Badge variant="outline" className="text-xs">
                    Rinnovo
                  </Badge>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4">
              <Calculator className="h-4 w-4 mr-2" />
              Genera Preventivi Rinnovo
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Azioni Rapide</CardTitle>
          <CardDescription>
            Accesso veloce alle funzioni più utilizzate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button className="h-20 flex-col space-y-2" variant="outline">
              <Users className="h-6 w-6" />
              <span>Nuovo Cliente</span>
            </Button>
            <Button className="h-20 flex-col space-y-2" variant="outline">
              <Package className="h-6 w-6" />
              <span>Carica Prodotto</span>
            </Button>
            <Button className="h-20 flex-col space-y-2" variant="outline">
              <FileText className="h-6 w-6" />
              <span>Nuovo Contratto</span>
            </Button>
            <Button className="h-20 flex-col space-y-2" variant="outline">
              <Calculator className="h-6 w-6" />
              <span>Crea Preventivo</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}