import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, MapPin, Clock, TrendingUp, Battery, Users, Building } from "lucide-react";
import { kaggleDataService, ProcessedStation } from "@/services/kaggleDataService";

const Dashboard = () => {
  const [stations, setStations] = useState<ProcessedStation[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const allStations = await kaggleDataService.getAllStations();
        const stats = await kaggleDataService.getStatistics();
        
        // Get top 4 stations by rating
        const topStations = allStations
          .filter(station => station.status === 'active')
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 4);
        
        setStations(topStations);
        setStatistics(stats);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const metrics = statistics ? [
    { title: "Active Stations", value: statistics.activeStations.toString(), change: "+12%", icon: Zap },
    { title: "Avg. Wait Time", value: "8 min", change: "-23%", icon: Clock },
    { title: "Daily Sessions", value: "15,634", change: "+18%", icon: Users },
    { title: "Network Efficiency", value: `${statistics.utilization}%`, change: "+5%", icon: TrendingUp },
  ] : [];

  const getAvailabilityBadge = (station: ProcessedStation) => {
    const percentage = (station.available / station.total) * 100;
    if (station.status === 'offline') return <Badge variant="destructive" className="text-xs">Offline</Badge>;
    if (station.status === 'maintenance') return <Badge variant="secondary" className="text-xs">Maintenance</Badge>;
    if (percentage > 50) return <Badge variant="default" className="text-xs">Available</Badge>;
    if (percentage > 0) return <Badge variant="secondary" className="text-xs">Limited</Badge>;
    return <Badge variant="destructive" className="text-xs">Full</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-success">
                  {metric.change} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Real-time Station Status */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Top Rated Stations (Kaggle Data)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stations.map((station) => {
              const utilization = Math.round((station.available / station.total) * 100);
              return (
                <div
                  key={station.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/30"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{station.name}</h3>
                      {getAvailabilityBadge(station)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {station.location}, {station.state}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {station.operator}
                      </span>
                      <span className="flex items-center gap-1">
                        <Battery className="h-3 w-3" />
                        {station.available}/{station.total} ports
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{station.powerOutput}</span>
                      <span>•</span>
                      <span>{station.rating} ⭐ ({station.reviews} reviews)</span>
                    </div>
                  </div>
                  <div className="text-right min-w-[100px]">
                    <div className="text-sm font-medium mb-1">
                      {utilization}% utilization
                    </div>
                    <Progress 
                      value={utilization} 
                      className="w-20 h-2"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;