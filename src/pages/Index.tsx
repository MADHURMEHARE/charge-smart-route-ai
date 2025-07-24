import NavBar from "@/components/NavBar";
import HeroSection from "@/components/HeroSection";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main>
        <HeroSection />
        <section className="container mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Real-time Infrastructure <span className="text-primary">Monitoring</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Monitor charging station availability, predict demand patterns, and optimize 
              routing across India's growing EV infrastructure network.
            </p>
          </div>
          <Dashboard />
        </section>
      </main>
    </div>
  );
};

export default Index;
