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
  const [temp2, setTemp2] = useState(35.3);
  const [waterLevel, setWaterLevel] = useState(75); // Default 75%
  
  const [temp1History, setTemp1History] = useState(() => generateHistoricalData(22.5, 5));
  const [temp2History, setTemp2History] = useState(() => generateHistoricalData(35.3, 8));
  const [waterHistory, setWaterHistory] = useState(() => 
    Array(20).fill(null).map((_, i) => ({
      time: new Date(Date.now() - (19 - i) * 5 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      value: 75
    }))
  );

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
        const clampedVal = Math.max(20, Math.min(50, newVal));
        setTemp2History(prev => [...prev.slice(1), { time: timeStr, value: clampedVal }]);
        return clampedVal;
      });

      // Update water level - only 25%, 50%, or 75%
      setWaterLevel(prev => {
        const possibleValues = [25, 50, 75];
        const randomChange = Math.random();
        // 80% chance to stay the same, 20% chance to change
        let newVal = prev;
        if (randomChange > 0.8) {
          newVal = possibleValues[Math.floor(Math.random() * possibleValues.length)];
        }
        setWaterHistory(prevHistory => [...prevHistory.slice(1), { time: timeStr, value: newVal }]);
        return newVal;
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">FED_DIAG UIC DEMO - MÁV</h1>
        </header>

        <div className="space-y-6">
          {/* Audio Player */}
          <AudioPlayer />

          {/* Temperature Sensors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <TemperatureGauge 
                label="Hőmérő 1" 
                temperature={temp1}
                min={0}
                max={50}
              />
              <HistoricalChart 
                title="Hőmérő 1 előző értékei"
                data={temp1History}
                color="hsl(var(--primary))"
                unit="°C"
              />
            </div>
            
            <div className="space-y-4">
              <TemperatureGauge 
                label="Hőmérő 2" 
                temperature={temp2}
                min={0}
                max={50}
              />
              <HistoricalChart 
                title="Hőmérő 2 előző értékei"
                data={temp2History}
                color="hsl(var(--accent))"
                unit="°C"
              />
            </div>
          </div>

          {/* Water Level Indicator */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WaterLevelIndicator 
              label="Víztartály"
              level={waterLevel}
            />
            <HistoricalChart 
              title="Vízszint előző értékei"
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
