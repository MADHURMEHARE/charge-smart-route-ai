import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, MapPin, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-charging.jpg";

const HeroSection = () => {
  return (
    <div className="relative min-h-[80vh] flex items-center overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Electric vehicle charging station" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      </div>

      {/* Electric glow effects */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-pulse-glow delay-1000" />

      {/* Content */}
      <div className="relative container mx-auto px-6 py-20">
        <div className="max-w-4xl">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">
            <Zap className="w-3 h-3 mr-1" />
            AI-Powered EV Infrastructure
          </Badge>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Charge
            <span className="bg-electric-gradient bg-clip-text text-transparent">
              Smart
            </span>
            <br />
            <span className="text-accent">Drive</span> Further
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
            India's first AI-driven platform that optimizes EV charging infrastructure through 
            predictive analytics, real-time availability tracking, and intelligent routing.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link to="/stations">
              <Button size="lg" className="bg-electric-gradient hover:opacity-90 text-primary-foreground shadow-electric">
                <MapPin className="w-4 h-4 mr-2" />
                Find Charging Stations
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/analytics">
              <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/10">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </Link>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center sm:text-left">
              <div className="text-3xl font-bold text-primary">1,247+</div>
              <div className="text-sm text-muted-foreground">Active Stations</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-3xl font-bold text-accent">94.2%</div>
              <div className="text-sm text-muted-foreground">Network Efficiency</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-3xl font-bold text-warning">8 min</div>
              <div className="text-sm text-muted-foreground">Avg. Wait Time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;