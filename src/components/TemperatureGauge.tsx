import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface TemperatureGaugeProps {
  label: string;
  temperature: number;
  min?: number;
  max?: number;
}

export const TemperatureGauge = ({ label, temperature, min = 0, max = 100 }: TemperatureGaugeProps) => {
  const [displayTemp, setDisplayTemp] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setDisplayTemp(temperature), 100);
    return () => clearTimeout(timer);
  }, [temperature]);

  const percentage = ((displayTemp - min) / (max - min)) * 100;
  const angle = (percentage / 100) * 270 - 135; // -135 to 135 degrees

  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-sm font-medium text-muted-foreground mb-4 text-center">{label}</h3>
      <div className="relative w-48 h-48 mx-auto">
        {/* Outer circle */}
        <div className="absolute inset-0 rounded-full border-8 border-muted"></div>
        
        {/* Progress arc */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="16"
            strokeDasharray={`${(270 / 360) * (2 * Math.PI * 85)} ${2 * Math.PI * 85}`}
            strokeDashoffset={2 * Math.PI * 85 * 0.125}
            className="transition-all duration-1000"
            style={{
              strokeDashoffset: 2 * Math.PI * 85 * (0.125 + (1 - percentage / 100) * 0.75),
            }}
            strokeLinecap="round"
          />
        </svg>

        {/* Needle */}
        <div 
          className="absolute top-1/2 left-1/2 w-1 h-20 bg-accent origin-bottom transition-transform duration-1000"
          style={{ 
            transform: `translate(-50%, -100%) rotate(${angle}deg)`,
          }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent"></div>
        </div>

        {/* Center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-card border-4 border-primary flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{displayTemp.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">°C</div>
          </div>
        </div>

        {/* Min/Max labels */}
        <div className="absolute bottom-4 left-4 text-xs text-muted-foreground">{min}°</div>
        <div className="absolute bottom-4 right-4 text-xs text-muted-foreground">{max}°</div>
      </div>
    </Card>
  );
};
