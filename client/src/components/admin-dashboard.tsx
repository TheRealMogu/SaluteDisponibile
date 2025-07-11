import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  Shield,
  Monitor
} from "lucide-react";

interface SystemStatus {
  isRunning: boolean;
  lastCheck: Date;
  totalChecks: number;
  totalUsers: number;
  errors: string[];
  uptime: number;
  regions: {
    [key: string]: {
      status: string;
      lastScrape: Date;
    };
  };
  health: 'healthy' | 'warning' | 'critical';
}

interface AdminDashboardProps {
  onClose?: () => void;
}

export default function AdminDashboard({ onClose }: AdminDashboardProps = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const [password, setPassword] = useState("");

  const { data: status, isLoading, error, refetch } = useQuery<SystemStatus>({
    queryKey: ['/api/system/status'],
    enabled: isVisible,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: monitoringStatus } = useQuery({
    queryKey: ['/api/monitoring/status'],
    enabled: isVisible,
    refetchInterval: 30000,
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { // Simple password for demo
      setIsVisible(true);
    } else {
      alert('Password non valida');
    }
  };

  const formatUptime = (uptime: number) => {
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (!isVisible) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Admin Dashboard</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Inserisci password admin"
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">Accedi</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsVisible(false)}
                  className="flex-1"
                >
                  Annulla
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Caricamento dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Errore di connessione</h2>
            <p className="text-gray-600 mb-4">Impossibile caricare i dati del sistema</p>
            <Button onClick={() => refetch()}>Riprova</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <Monitor className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-600">SaluteDisponibile.it</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Aggiorna
            </Button>
            <Button onClick={() => {
              setIsVisible(false);
              onClose?.();
            }} variant="outline">
              Chiudi
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Stato Sistema</p>
                  <p className="text-2xl font-bold">
                    {status.health === 'healthy' ? 'Attivo' : 'Warning'}
                  </p>
                </div>
                {status.health === 'healthy' ? (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Utenti Attivi</p>
                  <p className="text-2xl font-bold">{status.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Controlli Totali</p>
                  <p className="text-2xl font-bold">{status.totalChecks}</p>
                </div>
                <Activity className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Uptime</p>
                  <p className="text-2xl font-bold">{formatUptime(status.uptime)}</p>
                </div>
                <Clock className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Regions Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Stato Regioni</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(status.regions).map(([region, data]) => (
                  <div key={region} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant={data.status === 'active' ? 'default' : 'destructive'}>
                        {data.status === 'active' ? 'Attivo' : 'Inattivo'}
                      </Badge>
                      <span className="font-medium capitalize">{region}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {new Date(data.lastScrape).toLocaleTimeString('it-IT')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ultimi Errori</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {status.errors.length > 0 ? (
                  status.errors.slice(-5).map((error, index) => (
                    <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">Nessun errore recente</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informazioni Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Ultimo Controllo</p>
                <p className="font-mono text-sm">
                  {new Date(status.lastCheck).toLocaleString('it-IT')}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Monitoring</p>
                <Badge variant={status.isRunning ? 'default' : 'destructive'}>
                  {status.isRunning ? 'In Esecuzione' : 'Fermo'}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Salute Sistema</p>
                <Badge variant={status.health === 'healthy' ? 'default' : 'destructive'}>
                  {status.health === 'healthy' ? 'Sano' : 'Attenzione'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}