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
  const [water1, setWater1] = useState(76);
  const [water2, setWater2] = useState(28);
  
  const [temp1History, setTemp1History] = useState(() => generateHistoricalData(22.5, 5));
  const [temp2History, setTemp2History] = useState(() => generateHistoricalData(45.3, 8));
  const [water1History, setWater1History] = useState(() => generateHistoricalData(76, 10));
  const [water2History, setWater2History] = useState(() => generateHistoricalData(28, 10));

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

      // Update water levels
      setWater1(prev => {
        const newVal = prev + (Math.random() - 0.5) * 4;
        const clampedVal = Math.max(65, Math.min(85, newVal));
        setWater1History(prev => [...prev.slice(1), { time: timeStr, value: clampedVal }]);
        return clampedVal;
      });

      setWater2(prev => {
        const newVal = prev + (Math.random() - 0.5) * 4;
        const clampedVal = Math.max(18, Math.min(35, newVal));
        setWater2History(prev => [...prev.slice(1), { time: timeStr, value: clampedVal }]);
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

          {/* Water Level Indicators */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <WaterLevelIndicator 
                label="Water Tank 1"
                level={water1}
                alertLevel={75}
              />
              <HistoricalChart 
                title="Water Level 1 History"
                data={water1History}
                color="hsl(var(--primary))"
                unit="%"
              />
            </div>

            <div className="space-y-4">
              <WaterLevelIndicator 
                label="Water Tank 2"
                level={water2}
                alertLevel={25}
              />
              <HistoricalChart 
                title="Water Level 2 History"
                data={water2History}
                color="hsl(var(--accent))"
                unit="%"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
