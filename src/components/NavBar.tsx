import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Menu, MapPin, BarChart3, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const NavBar = () => {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-electric-gradient rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">ChargeSmart</h1>
              <p className="text-xs text-muted-foreground">AI Infrastructure Optimizer</p>
            </div>
          </Link>

          {/* Navigation Links - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/stations">
              <Button 
                variant={location.pathname === "/stations" ? "default" : "ghost"} 
                size="sm" 
                className="gap-2"
              >
                <MapPin className="w-4 h-4" />
                Stations
              </Button>
            </Link>
            <Link to="/analytics">
              <Button 
                variant={location.pathname === "/analytics" ? "default" : "ghost"} 
                size="sm" 
                className="gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Button>
            </Link>
            <Link to="/settings">
              <Button 
                variant={location.pathname === "/settings" ? "default" : "ghost"} 
                size="sm" 
                className="gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <Link to="/live">
              <Badge variant="outline" className="hidden sm:flex bg-accent/20 text-accent border-accent/30 hover:bg-accent/30 cursor-pointer">
                <div className="w-2 h-2 bg-accent rounded-full mr-2 animate-pulse" />
                Live
              </Badge>
            </Link>
            <Link to="/">
              <Button size="sm" className="bg-electric-gradient hover:opacity-90">
                Dashboard
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;