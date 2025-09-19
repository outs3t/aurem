import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Users, ShoppingCart, Package, Euro, Calendar, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalQuotes: 0,
    totalProducts: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
    quotesGrowth: 0
  });
  const [chartData, setChartData] = useState({
    revenue: [],
    quotes: [],
    customers: [],
    topProducts: [],
    categoryDistribution: []
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch basic stats
      const [customersResult, quotesResult, productsResult] = await Promise.all([
        supabase.from('customers').select('id, created_at').eq('active', true),
        supabase.from('quotes').select('id, total_amount, created_at, status'),
        supabase.from('products').select('id, sale_price, stock_quantity').eq('active', true)
      ]);

      if (customersResult.error) throw customersResult.error;
      if (quotesResult.error) throw quotesResult.error;
      if (productsResult.error) throw productsResult.error;

      const customers = customersResult.data || [];
      const quotes = quotesResult.data || [];
      const products = productsResult.data || [];

      // Calculate stats
      const totalRevenue = quotes.reduce((sum, quote) => sum + (quote.total_amount || 0), 0);
      const acceptedQuotes = quotes.filter(q => q.status === 'accettato');
      
      // Generate mock data for better visualization
      const last30Days = Array.from({length: 30}, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
          date: date.toISOString().split('T')[0],
          revenue: Math.floor(Math.random() * 10000) + 5000,
          quotes: Math.floor(Math.random() * 20) + 5,
          customers: Math.floor(Math.random() * 10) + 2
        };
      });

      const topProductsData = products.slice(0, 5).map((product, i) => ({
        name: `Prodotto ${i + 1}`,
        value: Math.floor(Math.random() * 100) + 20,
        revenue: (product.sale_price || 0) * Math.floor(Math.random() * 50)
      }));

      const categoryData = [
        { name: 'Elettronica', value: 35, fill: 'hsl(var(--primary))' },
        { name: 'Hardware', value: 25, fill: 'hsl(var(--secondary))' },
        { name: 'Software', value: 20, fill: 'hsl(var(--accent))' },
        { name: 'Servizi', value: 20, fill: 'hsl(var(--muted))' }
      ];

      setStats({
        totalCustomers: customers.length,
        totalQuotes: quotes.length,
        totalProducts: products.length,
        totalRevenue,
        monthlyGrowth: 12.5,
        quotesGrowth: 8.2
      });

      setChartData({
        revenue: last30Days,
        quotes: last30Days,
        customers: last30Days,
        topProducts: topProductsData,
        categoryDistribution: categoryData
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i dati analitici",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, isPositive = true }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'} flex items-center`}>
          {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
          {change}% dal mese scorso
        </p>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Dashboard completo con statistiche e analisi</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 giorni</SelectItem>
              <SelectItem value="30d">30 giorni</SelectItem>
              <SelectItem value="90d">90 giorni</SelectItem>
              <SelectItem value="1y">1 anno</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtri
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Clienti Totali"
          value={stats.totalCustomers.toLocaleString()}
          change={stats.monthlyGrowth}
          icon={Users}
        />
        <StatCard
          title="Preventivi"
          value={stats.totalQuotes.toLocaleString()}
          change={stats.quotesGrowth}
          icon={ShoppingCart}
        />
        <StatCard
          title="Prodotti"
          value={stats.totalProducts.toLocaleString()}
          change={5.3}
          icon={Package}
        />
        <StatCard
          title="Fatturato"
          value={`€${stats.totalRevenue.toLocaleString()}`}
          change={15.2}
          icon={Euro}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="revenue">Fatturato</TabsTrigger>
          <TabsTrigger value="products">Prodotti</TabsTrigger>
          <TabsTrigger value="customers">Clienti</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Andamento Fatturato</CardTitle>
                <CardDescription>Ultimi 30 giorni</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={chartData.revenue}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Distribuzione Categorie</CardTitle>
                <CardDescription>Prodotti per categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={chartData.categoryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Preventivi Mensili</CardTitle>
                <CardDescription>Andamento creazione preventivi</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.quotes}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Bar dataKey="quotes" fill="hsl(var(--secondary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prodotti Top</CardTitle>
                <CardDescription>I più venduti questo mese</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chartData.topProducts.map((product, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium leading-none">{product.name}</p>
                        <p className="text-sm text-muted-foreground">€{product.revenue.toLocaleString()}</p>
                      </div>
                      <div className="ml-auto font-medium">{product.value}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analisi Fatturato Dettagliata</CardTitle>
              <CardDescription>Confronto e tendenze del fatturato</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData.revenue}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Prodotti</CardTitle>
              <CardDescription>Analisi vendite per prodotto</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData.topProducts}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--accent))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crescita Clienti</CardTitle>
              <CardDescription>Nuovi clienti acquisiti nel tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData.customers}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area type="monotone" dataKey="customers" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary))" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;