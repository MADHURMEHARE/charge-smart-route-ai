import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, MapPin, Clock, TrendingUp, Battery, Users, AlertTriangle, CheckCircle, Activity, Wifi, WifiOff } from "lucide-react";
import NavBar from "@/components/NavBar";
import { useRealTime } from "@/hooks/useRealTime";
import RealTimeControls from "@/components/RealTimeControls";

const Live = () => {
  const { stations, alerts, metrics, isConnected, dismissAlert } = useRealTime();

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour ago`;
    return `${Math.floor(diffInSeconds / 86400)} day ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container mx-auto px-6 py-8 pt-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">Live Monitoring</h1>
            <Badge className={`flex items-center gap-2 ${
              isConnected 
                ? "bg-accent/20 text-accent border-accent/30" 
                : "bg-destructive/20 text-destructive border-destructive/30"
            }`}>
              {isConnected ? (
                <Wifi className="w-3 h-3" />
              ) : (
                <WifiOff className="w-3 h-3" />
              )}
              <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-accent animate-pulse" : "bg-destructive"}`} />
              {isConnected ? "Live" : "Offline"}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {isConnected 
              ? "Real-time monitoring of EV charging infrastructure across India"
              : "Connection lost. Data may not be up to date."
            }
          </p>
        </div>

        {/* Live Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Sessions
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeSessions.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className="h-3 w-3 text-success" />
                <span className="text-success">+12 from last hour</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Power
              </CardTitle>
              <Zap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalPower}</div>
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className="h-3 w-3 text-success" />
                <span className="text-success">+8% from last hour</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Network Uptime
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.networkUptime}</div>
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className="h-3 w-3 text-success" />
                <span className="text-success">+0.2% from last hour</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg. Response Time
              </CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.avgResponseTime}</div>
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className="h-3 w-3 text-destructive rotate-180" />
                <span className="text-destructive">-0.5s from last hour</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="stations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stations">Live Stations ({stations.length})</TabsTrigger>
            <TabsTrigger value="alerts">System Alerts ({alerts.filter(a => !a.isRead).length})</TabsTrigger>
          </TabsList>

          <TabsContent value="stations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {stations.map((station) => (
                <Card key={station.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg mb-1">{station.name}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin className="w-4 h-4" />
                          {station.location}
                        </div>
                      </div>
                      <Badge 
                        variant={station.status === "active" ? "default" : "destructive"}
                        className="flex items-center gap-1"
                      >
                        {station.status === "active" ? (
                          <Activity className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        {station.status === "active" ? "Active" : station.status === "maintenance" ? "Maintenance" : "Offline"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Available Ports:</span>
                          <div className="font-semibold">{station.available}/{station.total}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Current Power:</span>
                          <div className="font-semibold text-primary">{station.currentPower}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Session Time:</span>
                          <div className="font-semibold">{station.sessionTime}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Efficiency:</span>
                          <div className="font-semibold">{station.efficiency}%</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Efficiency</span>
                          <span>{station.efficiency}%</span>
                        </div>
                        <Progress value={station.efficiency} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Last updated: {formatTimeAgo(station.lastUpdate)}</span>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Alerts & Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No alerts at the moment
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <div key={alert.id} className={`flex items-start gap-3 p-4 rounded-lg border ${
                        alert.isRead ? "border-border/30 opacity-60" : "border-border/30"
                      }`}>
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          alert.type === "warning" ? "bg-warning" :
                          alert.type === "success" ? "bg-success" : 
                          alert.type === "error" ? "bg-destructive" : "bg-primary"
                        }`} />
                        <div className="flex-1">
                          <p className={`font-medium mb-1 ${alert.isRead ? "line-through" : ""}`}>
                            {alert.message}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {alert.location} • {formatTimeAgo(alert.time)}
                          </div>
                        </div>
                        {!alert.isRead && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => dismissAlert(alert.id)}
                          >
                            Dismiss
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Real-time Controls for Testing */}
      <RealTimeControls />
    </div>
  );
};

export default Live; 