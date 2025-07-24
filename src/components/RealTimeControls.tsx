import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';
import { realTimeSimulator } from '@/utils/realTimeSimulator';

const RealTimeControls = () => {
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    // Check if simulator is running on mount
    setIsSimulating(realTimeSimulator.isRunning);
  }, []);

  const startSimulation = () => {
    realTimeSimulator.start();
    setIsSimulating(true);
  };

  const stopSimulation = () => {
    realTimeSimulator.stop();
    setIsSimulating(false);
  };

  const resetData = async () => {
    // This would reset all data in production
    // For now, just restart the simulation
    stopSimulation();
    setTimeout(() => {
      startSimulation();
    }, 1000);
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Zap className="w-4 h-4" />
          Real-time Simulator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Badge variant={isSimulating ? "default" : "secondary"}>
            {isSimulating ? "Running" : "Stopped"}
          </Badge>
        </div>
        
        <div className="flex gap-2">
          {isSimulating ? (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={stopSimulation}
              className="flex-1"
            >
              <Pause className="w-4 h-4 mr-2" />
              Stop
            </Button>
          ) : (
            <Button 
              size="sm" 
              onClick={startSimulation}
              className="flex-1"
            >
              <Play className="w-4 h-4 mr-2" />
              Start
            </Button>
          )}
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={resetData}
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p>• Updates stations every 5-15 seconds</p>
          <p>• Generates alerts every 30 seconds</p>
          <p>• Updates metrics every 10 seconds</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimeControls; 