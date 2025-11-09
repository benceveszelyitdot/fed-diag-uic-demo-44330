import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface WaterLevelIndicatorProps {
  label: string;
  level: number; // 1, 2, or 3 (representing 1/3, 2/3, 3/3)
}

export const WaterLevelIndicator = ({ label, level }: WaterLevelIndicatorProps) => {
  const [displayLevel, setDisplayLevel] = useState(level);
  
  useEffect(() => {
    const timer = setTimeout(() => setDisplayLevel(level), 100);
    return () => clearTimeout(timer);
  }, [level]);

  // Convert 1/3, 2/3, 3/3 to percentage for display
  const percentageLevel = (displayLevel / 3) * 100;
  const isAtLowLevel = displayLevel === 1;

  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-sm font-medium text-muted-foreground mb-4 text-center">{label}</h3>
      <div className="flex items-end justify-center gap-8">
        {/* Tank visualization */}
        <div className="relative w-32 h-64 bg-muted rounded-lg border-4 border-border overflow-hidden">
          {/* 1/3 Alert level line */}
          <div 
            className="absolute left-0 right-0 border-t-2 border-dashed border-accent z-10"
            style={{ bottom: '33.33%' }}
          >
            <span className="absolute right-2 -top-3 text-xs font-medium text-accent">
              1/3
            </span>
          </div>

          {/* Water */}
          <div 
            className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 ${
              isAtLowLevel ? 'bg-accent' : 'bg-primary'
            }`}
            style={{ height: `${percentageLevel}%` }}
          >
            {/* Water wave effect */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-transparent to-white/10"></div>
          </div>

          {/* Measurement lines */}
          {[1, 2, 3].map((mark) => (
            <div
              key={mark}
              className="absolute left-0 right-0 border-t border-border/30"
              style={{ bottom: `${(mark / 3) * 100}%` }}
            >
              <span className="absolute left-2 -top-2 text-xs text-muted-foreground">
                {mark}/3
              </span>
            </div>
          ))}
        </div>

        {/* Current level display */}
        <div className="text-center">
          <div className="text-4xl font-bold text-foreground">{displayLevel}/3</div>
          <div className="text-sm text-muted-foreground">Level</div>
          {isAtLowLevel && (
            <div className="mt-2 text-xs font-medium text-accent">Low Alert (1/3)</div>
          )}
        </div>
      </div>
    </Card>
  );
};
