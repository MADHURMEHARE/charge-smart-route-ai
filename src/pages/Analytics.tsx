import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Zap, Users, Clock, MapPin } from "lucide-react";
import NavBar from "@/components/NavBar";

const Analytics = () => {
  const dailyData = [
    { day: "Mon", sessions: 1200, revenue: 18000, efficiency: 92 },
    { day: "Tue", sessions: 1350, revenue: 20250, efficiency: 94 },
    { day: "Wed", sessions: 1100, revenue: 16500, efficiency: 89 },
    { day: "Thu", sessions: 1400, revenue: 21000, efficiency: 96 },
    { day: "Fri", sessions: 1600, revenue: 24000, efficiency: 98 },
    { day: "Sat", sessions: 1800, revenue: 27000, efficiency: 95 },
    { day: "Sun", sessions: 1500, revenue: 22500, efficiency: 93 }
  ];

  const locationData = [
    { name: "Mumbai", sessions: 4200, percentage: 35 },
    { name: "Delhi", sessions: 3800, percentage: 32 },
    { name: "Bangalore", sessions: 2800, percentage: 23 },
    { name: "Pune", sessions: 1200, percentage: 10 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const metrics = [
    { title: "Total Sessions", value: "12,450", change: "+18%", trend: "up", icon: Users },
    { title: "Revenue", value: "₹1.87L", change: "+23%", trend: "up", icon: TrendingUp },
    { title: "Avg. Session Time", value: "32 min", change: "-8%", trend: "down", icon: Clock },
    { title: "Network Efficiency", value: "94.2%", change: "+5%", trend: "up", icon: Zap }
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container mx-auto px-6 py-8 pt-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive insights into EV charging infrastructure performance</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                  <div className="flex items-center gap-1 text-xs">
                    {metric.trend === "up" ? (
                      <TrendingUp className="h-3 w-3 text-success" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-destructive" />
                    )}
                    <span className={metric.trend === "up" ? "text-success" : "text-destructive"}>
                      {metric.change} from last month
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <Tabs defaultValue="daily" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">Daily Trends</TabsTrigger>
            <TabsTrigger value="location">Location Analysis</TabsTrigger>
            <TabsTrigger value="efficiency">Efficiency Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Charging Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="sessions" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="revenue" stroke="#00C49F" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="location" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sessions by Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={locationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name} ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="sessions"
                      >
                        {locationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Location Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {locationData.map((location, index) => (
                      <div key={location.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{location.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{location.sessions.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">{location.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="efficiency" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Network Efficiency Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="efficiency" stroke="#FFBB28" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics; 