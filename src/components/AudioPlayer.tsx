import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Square } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = 'http://192.168.2.216:3001';
const WS_URL = 'ws://192.168.2.216:3001';
const AUDIO_FILE_PATH = '/opt/infopix/fed-diag-uic-demo-44330/vaganyzar_felolvasva.wav';

export const AudioPlayer = () => {
  const [vetelActive, setVetelActive] = useState(false);
  const [musorActive, setMusorActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket connection for lamp state updates
  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'lampUpdate') {
          setVetelActive(data.lamps.vetel);
          setMusorActive(data.lamps.musor);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast.error('Backend connection error');
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };
    
    wsRef.current = ws;
    
    return () => {
      ws.close();
    };
  }, []);

  const handlePlay = async () => {
    try {
      // Send play command to backend
      const response = await fetch(`${BACKEND_URL}/api/play`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Backend play command failed');
      }
      
      // Start audio playback
      if (audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Play error:', error);
      toast.error('Failed to start playback');
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleStop = async () => {
    try {
      // Send stop command to backend (clears all lamps)
      const response = await fetch(`${BACKEND_URL}/api/stop`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Backend stop command failed');
      }
      
      // Stop audio playback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Stop error:', error);
      toast.error('Failed to stop playback');
    }
  };

  return (
    <Card className="p-6 bg-card border-border">
      <h2 className="text-lg font-semibold mb-4 text-foreground">UIC TTS bemondás</h2>
      
      <div className="space-y-4">
        {/* Control Buttons */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handlePlay}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Play className="w-5 h-5 mr-2" />
            Bemondás indítása
          </Button>

          <Button
            onClick={handleStop}
            size="lg"
            variant="destructive"
          >
            <Square className="w-5 h-5 mr-2" />
            Bemondás leállítása
          </Button>
        </div>

        {/* Indicator Lamps */}
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full border-2 transition-all ${vetelActive ? 'bg-green-500 border-green-600 shadow-lg shadow-green-500/50' : 'bg-muted border-border'}`} />
            <span className="text-xs text-muted-foreground font-medium">VÉTEL</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full border-2 transition-all ${musorActive ? 'bg-red-500 border-red-600 shadow-lg shadow-red-500/50' : 'bg-muted border-border'}`} />
            <span className="text-xs text-muted-foreground font-medium">MŰSOR</span>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={AUDIO_FILE_PATH}
        preload="metadata"
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
    </Card>
  );
};
