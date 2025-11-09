import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface WaterLevelIndicatorProps {
  label: string;
  level: number; // 0-100
}

export const WaterLevelIndicator = ({ label, level }: WaterLevelIndicatorProps) => {
  const [displayLevel, setDisplayLevel] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setDisplayLevel(level), 100);
    return () => clearTimeout(timer);
  }, [level]);

  const isAtLowLevel = Math.abs(displayLevel - 25) < 5;

  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-sm font-medium text-muted-foreground mb-4 text-center">{label}</h3>
      <div className="flex items-end justify-center gap-8">
        {/* Tank visualization */}
        <div className="relative w-32 h-64 bg-muted rounded-lg border-4 border-border overflow-hidden">
          {/* 25% Alert level line */}
          <div 
            className="absolute left-0 right-0 border-t-2 border-dashed border-accent z-10"
            style={{ bottom: '25%' }}
          >
            <span className="absolute right-2 -top-3 text-xs font-medium text-accent">
              25%
            </span>
          </div>

          {/* Water */}
          <div 
            className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 ${
              isAtLowLevel ? 'bg-accent' : 'bg-primary'
            }`}
            style={{ height: `${displayLevel}%` }}
          >
            {/* Water wave effect */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-transparent to-white/10"></div>
          </div>

          {/* Measurement lines */}
          {[0, 50, 100].map((mark) => (
            <div
              key={mark}
              className="absolute left-0 right-0 border-t border-border/30"
              style={{ bottom: `${mark}%` }}
            >
              <span className="absolute left-2 -top-2 text-xs text-muted-foreground">
                {mark}
              </span>
            </div>
          ))}
        </div>

        {/* Current level display */}
        <div className="text-center">
          <div className="text-4xl font-bold text-foreground">{displayLevel.toFixed(1)}</div>
          <div className="text-sm text-muted-foreground">%</div>
          {isAtLowLevel && (
            <div className="mt-2 text-xs font-medium text-accent">Low Alert (25%)</div>
          )}
        </div>
      </div>
    </Card>
  );
};
