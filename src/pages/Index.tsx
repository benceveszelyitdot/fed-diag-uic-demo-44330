import { useState, useEffect } from "react";
import { AudioPlayer } from "@/components/AudioPlayer";
import { TemperatureGauge } from "@/components/TemperatureGauge";
import { WaterLevelIndicator } from "@/components/WaterLevelIndicator";
import { HistoricalChart } from "@/components/HistoricalChart";

const Index = () => {
  const [temp1, setTemp1] = useState(0);
  const [temp2, setTemp2] = useState(0);
  const [waterLevel, setWaterLevel] = useState(1); // 1, 2, or 3 (default full)
  
  const [temp1History, setTemp1History] = useState(() => 
    Array(20).fill(null).map((_, i) => ({
      time: new Date(Date.now() - (19 - i) * 5 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      value: 0
    }))
  );
  const [temp2History, setTemp2History] = useState(() => 
    Array(20).fill(null).map((_, i) => ({
      time: new Date(Date.now() - (19 - i) * 5 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      value: 0
    }))
  );
  const [waterHistory, setWaterHistory] = useState(() => 
    Array(20).fill(null).map((_, i) => ({
      time: new Date(Date.now() - (19 - i) * 5 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      value: 0.33 // 1/3 normalized to 0-1 range (default full)
    }))
  );

  // Connect to backend WebSocket for real-time sensor updates
  useEffect(() => {
    // Use secure WebSocket when page is served over HTTPS
    const isSecure = window.location.protocol === 'https:';
    const isLovablePreview = window.location.hostname.includes('lovableproject.com');
    
    // Skip backend connection in Lovable preview
    if (isLovablePreview) {
      console.log('Backend not configured - running in preview mode');
      return;
    }
    
    const WS_URL = `${isSecure ? 'wss' : 'ws'}://192.168.2.216:3001`;
    const ws = new WebSocket(WS_URL);
    
    ws.onopen = () => {
      console.log('Connected to sensor WebSocket');
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      
      if (data.type === 'sensorUpdate') {
        const { sensors } = data;
        
        // Update temperatures
        setTemp1(sensors.temp1);
        setTemp1History(prev => [...prev.slice(1), { time: timeStr, value: sensors.temp1 }]);
        
        setTemp2(sensors.temp2);
        setTemp2History(prev => [...prev.slice(1), { time: timeStr, value: sensors.temp2 }]);
        
        // Update water level (1, 2, or 3)
        setWaterLevel(sensors.waterLevel);
        setWaterHistory(prev => [...prev.slice(1), { time: timeStr, value: sensors.waterLevel / 3 }]); // Normalize to 0-1
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('Disconnected from sensor WebSocket');
    };
    
    return () => {
      ws.close();
    };
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
              title="Víztartály szint előzmény"
              data={waterHistory}
              color="hsl(var(--chart-3))"
              unit=""
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
