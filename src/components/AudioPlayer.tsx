import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Square, Upload } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = 'http://localhost:3001';
const WS_URL = 'ws://localhost:3001';

export const AudioPlayer = () => {
  const [vetelActive, setVetelActive] = useState(false);
  const [musorActive, setMusorActive] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === "audio/mp3" || file.type === "audio/mpeg" || file.type === "audio/wav")) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setAudioFile(file);
      setIsPlaying(false);
      toast.success("Audio file loaded successfully");
    } else {
      toast.error("Please upload a valid MP3 or WAV file");
    }
  };

  const handlePlay = async () => {
    if (!audioFile) {
      fileInputRef.current?.click();
      return;
    }

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
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.wav,audio/mpeg,audio/wav"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            size="lg"
          >
            <Upload className="w-4 h-4 mr-2" />
            Hangfájl feltöltése
          </Button>
          
          <Button
            onClick={handlePlay}
            disabled={!audioFile || isPlaying}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
          >
            <Play className="w-5 h-5 mr-2" />
            Bemondás indítása
          </Button>

          <Button
            onClick={handleStop}
            disabled={!audioFile || !isPlaying}
            size="lg"
            variant="destructive"
            className="disabled:opacity-50"
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

      {audioFile && (
        <>
          <p className="mt-4 text-sm text-muted-foreground">
            Playing: {audioFile.name}
          </p>
          <audio
            ref={audioRef}
            src={URL.createObjectURL(audioFile)}
            preload="metadata"
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
          />
        </>
      )}
    </Card>
  );
};
