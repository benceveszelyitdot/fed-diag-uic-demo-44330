import { useState, useEffect } from "react";
import { AudioPlayer } from "@/components/AudioPlayer";
import { TemperatureGauge } from "@/components/TemperatureGauge";
import { WaterLevelIndicator } from "@/components/WaterLevelIndicator";
import { HistoricalChart } from "@/components/HistoricalChart";

// Generate mock historical data
const generateHistoricalData = (baseValue: number, variance: number, points: number = 20) => {
  const data = [];
  const now = new Date();
  for (let i = points - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 5 * 60 * 1000); // 5 minute intervals
    const value = baseValue + (Math.random() - 0.5) * variance;
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      value: Math.max(0, Math.min(100, value))
    });
  }
  return data;
};

const Index = () => {
  const [temp1, setTemp1] = useState(22.5);
  const [temp2, setTemp2] = useState(45.3);
  const [waterLevel, setWaterLevel] = useState(50);
  
  const [temp1History, setTemp1History] = useState(() => generateHistoricalData(22.5, 5));
  const [temp2History, setTemp2History] = useState(() => generateHistoricalData(45.3, 8));
  const [waterHistory, setWaterHistory] = useState(() => generateHistoricalData(50, 20));

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      // Update temperatures
      setTemp1(prev => {
        const newVal = prev + (Math.random() - 0.5) * 2;
        const clampedVal = Math.max(18, Math.min(28, newVal));
        setTemp1History(prev => [...prev.slice(1), { time: timeStr, value: clampedVal }]);
        return clampedVal;
      });

      setTemp2(prev => {
        const newVal = prev + (Math.random() - 0.5) * 3;
        const clampedVal = Math.max(40, Math.min(55, newVal));
        setTemp2History(prev => [...prev.slice(1), { time: timeStr, value: clampedVal }]);
        return clampedVal;
      });

      // Update water level
      setWaterLevel(prev => {
        const newVal = prev + (Math.random() - 0.5) * 5;
        const clampedVal = Math.max(10, Math.min(90, newVal));
        setWaterHistory(prev => [...prev.slice(1), { time: timeStr, value: clampedVal }]);
        return clampedVal;
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Monitoring Dashboard</h1>
          <p className="text-muted-foreground">Real-time sensor data and audio playback</p>
        </header>

        <div className="space-y-6">
          {/* Audio Player */}
          <AudioPlayer />

          {/* Temperature Sensors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <TemperatureGauge 
                label="Temperature Sensor 1" 
                temperature={temp1}
                min={0}
                max={50}
              />
              <HistoricalChart 
                title="Temperature 1 History"
                data={temp1History}
                color="hsl(var(--primary))"
                unit="°C"
              />
            </div>
            
            <div className="space-y-4">
              <TemperatureGauge 
                label="Temperature Sensor 2" 
                temperature={temp2}
                min={0}
                max={100}
              />
              <HistoricalChart 
                title="Temperature 2 History"
                data={temp2History}
                color="hsl(var(--accent))"
                unit="°C"
              />
            </div>
          </div>

          {/* Water Level Indicator */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WaterLevelIndicator 
              label="Water Tank"
              level={waterLevel}
            />
            <HistoricalChart 
              title="Water Level History"
              data={waterHistory}
              color="hsl(var(--primary))"
              unit="%"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
